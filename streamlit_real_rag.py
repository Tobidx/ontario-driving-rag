#!/usr/bin/env python3
"""
Streamlit RAG App - Using REAL Ontario Driver's Handbook Data
"""

import streamlit as st
import json
import os
import time
from pathlib import Path
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rank_bm25 import BM25Okapi
import re

# XAI Integration
try:
    from xai_sdk import Client
    from xai_sdk.chat import user, system
    XAI_AVAILABLE = True
except ImportError:
    XAI_AVAILABLE = False

# Configure the page
st.set_page_config(
    page_title="MTO RAG - Ontario Driving Assistant", 
    page_icon="🚗",
    layout="wide"
)

@st.cache_data
def load_knowledge_base():
    """Load the Ontario Driver's Handbook data"""
    try:
        # Try to load from data directory
        kb_path = Path("data/knowledge_base.json")
        if kb_path.exists():
            with open(kb_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            st.error("❌ Knowledge base not found! Make sure data/knowledge_base.json exists.")
            return []
    except Exception as e:
        st.error(f"❌ Error loading knowledge base: {str(e)}")
        return []

@st.cache_resource
def initialize_rag_system():
    """Initialize the RAG retrieval system"""
    knowledge_base = load_knowledge_base()
    
    if not knowledge_base:
        return None, None, None, None
    
    # Extract content and metadata
    documents = []
    metadata = []
    
    for item in knowledge_base:
        content = item.get('content', '')
        if content.strip():
            documents.append(content)
            metadata.append(item.get('metadata', {}))
    
    if not documents:
        st.error("❌ No valid documents found in knowledge base!")
        return None, None, None, None
    
    # Initialize TF-IDF
    tfidf = TfidfVectorizer(
        max_features=5000,
        stop_words='english',
        ngram_range=(1, 2),
        max_df=0.95,
        min_df=2
    )
    
    try:
        tfidf_matrix = tfidf.fit_transform(documents)
    except Exception as e:
        st.error(f"❌ TF-IDF initialization failed: {str(e)}")
        return None, None, None, None
    
    # Initialize BM25
    try:
        tokenized_docs = [doc.lower().split() for doc in documents]
        bm25 = BM25Okapi(tokenized_docs)
    except Exception as e:
        st.error(f"❌ BM25 initialization failed: {str(e)}")
        return None, None, None, None
    
    st.success(f"✅ RAG system initialized with {len(documents)} documents from Ontario Driver's Handbook")
    
    return documents, metadata, tfidf, bm25

def search_documents(query: str, documents: List[str], metadata: List[Dict], tfidf, bm25, top_k: int = 5):
    """Search documents using TF-IDF and BM25"""
    
    if not documents or not tfidf or not bm25:
        return []
    
    # Normalize query
    query_lower = query.lower()
    
    # TF-IDF search
    try:
        query_tfidf = tfidf.transform([query])
        doc_tfidf = tfidf.transform(documents)
        tfidf_scores = cosine_similarity(query_tfidf, doc_tfidf).flatten()
    except:
        tfidf_scores = np.zeros(len(documents))
    
    # BM25 search  
    try:
        query_tokens = query_lower.split()
        bm25_scores = bm25.get_scores(query_tokens)
    except:
        bm25_scores = np.zeros(len(documents))
    
    # Combine scores
    combined_scores = []
    for i in range(len(documents)):
        # Weighted combination
        combined_score = (0.6 * tfidf_scores[i]) + (0.4 * (bm25_scores[i] / (max(bm25_scores) + 1e-10)))
        
        # Boost for exact keyword matches
        doc_lower = documents[i].lower()
        keyword_bonus = 0
        for word in query_tokens:
            if word in doc_lower:
                keyword_bonus += 0.1
        
        final_score = combined_score + keyword_bonus
        
        combined_scores.append({
            'index': i,
            'score': final_score,
            'content': documents[i],
            'metadata': metadata[i]
        })
    
    # Sort by score and return top results
    combined_scores.sort(key=lambda x: x['score'], reverse=True)
    return combined_scores[:top_k]

def generate_answer_with_xai(query: str, relevant_docs: List[Dict], xai_client):
    """Generate answer using XAI Grok with retrieved documents"""
    
    if not xai_client:
        return "❌ XAI client not available. Please check your API key."
    
    # Prepare context from retrieved documents
    context_parts = []
    for i, doc in enumerate(relevant_docs[:3], 1):  # Use top 3 documents
        content = doc['content'][:800]  # Limit length
        page = doc['metadata'].get('page', 'N/A')
        context_parts.append(f"[Source {i} - Page {page}]: {content}")
    
    context = "\n\n".join(context_parts)
    
    # Create prompt
    prompt = f"""You are an expert on Ontario driving laws and regulations. Answer the following question using ONLY the provided context from the official Ontario Driver's Handbook.

Context from Ontario Driver's Handbook:
{context}

Question: {query}

Instructions:
- Provide a detailed, accurate answer based on the context provided
- If the context doesn't contain enough information, say so clearly
- Include specific details like speed limits, penalties, requirements, etc.
- Format your response clearly with bullet points or sections when appropriate
- Reference the page numbers from the sources when possible

Answer:"""

    try:
        response = xai_client.chat.completions.create(
            model="grok-beta",
            messages=[
                system("You are an expert assistant for Ontario driving laws. Provide accurate, detailed information based on the official handbook context provided."),
                user(prompt)
            ],
            temperature=0.1,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"❌ Error generating response: {str(e)}"

def main():
    st.title("🚗 MTO RAG - Ontario Driving Assistant")
    st.markdown("*Powered by the Official Ontario Driver's Handbook + XAI Grok*")
    
    # Initialize systems
    documents, metadata, tfidf, bm25 = initialize_rag_system()
    
    # Initialize XAI client
    xai_client = None
    if XAI_AVAILABLE and os.getenv("XAI_API_KEY"):
        try:
            xai_client = Client(api_key=os.getenv("XAI_API_KEY"))
            xai_status = "✅ Connected"
        except:
            xai_status = "❌ Connection failed"
    else:
        xai_status = "❌ API key missing"
    
    # Sidebar
    with st.sidebar:
        st.header("🎯 System Status")
        
        if documents:
            st.success(f"✅ Knowledge Base: {len(documents)} chunks loaded")
        else:
            st.error("❌ Knowledge Base: Not loaded")
            
        st.info(f"🤖 XAI Grok: {xai_status}")
        
        st.markdown("---")
        
        st.header("💡 Try These Questions")
        sample_questions = [
            "How do I get my G1 license?",
            "Can I drink alcohol while driving?",
            "What should I do when a school bus has flashing red lights?",
            "What are the speed limits on highways in Ontario?",
            "Can G1 drivers drive on 400-series highways?",
            "What are the penalties for distracted driving?",
            "What documents do I need for my driving test?",
            "How long do I need to hold my G1 before getting G2?"
        ]
        
        for question in sample_questions:
            if st.button(question, key=f"q_{hash(question)}"):
                st.session_state.preset_question = question
        
        st.markdown("---")
        
        # Stats
        if "query_count" not in st.session_state:
            st.session_state.query_count = 0
            
        st.metric("Questions Asked", st.session_state.query_count)

    # Main interface
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            
            if message["role"] == "assistant" and "sources" in message:
                with st.expander(f"📚 Sources ({len(message['sources'])} found)"):
                    for i, source in enumerate(message["sources"], 1):
                        score = source.get('score', 0)
                        page = source.get('metadata', {}).get('page', 'N/A')
                        content = source.get('content', '')[:300] + "..."
                        
                        st.markdown(f"""
                        **Source {i}** (Score: {score:.3f}, Page: {page})
                        
                        *{content}*
                        """)

    # Handle preset question
    user_input = None
    if "preset_question" in st.session_state:
        user_input = st.session_state.preset_question
        del st.session_state.preset_question

    # Chat input
    if not user_input:
        user_input = st.chat_input("Ask me anything about Ontario driving laws...")

    if user_input:
        # Update stats
        st.session_state.query_count += 1
        
        # Add user message
        st.session_state.messages.append({"role": "user", "content": user_input})
        
        with st.chat_message("user"):
            st.markdown(user_input)

        # Process query
        with st.chat_message("assistant"):
            if not documents:
                st.error("❌ Knowledge base not available")
                return
                
            with st.spinner("🔍 Searching Ontario Driver's Handbook..."):
                # Search for relevant documents
                start_time = time.time()
                relevant_docs = search_documents(user_input, documents, metadata, tfidf, bm25)
                search_time = time.time() - start_time
                
                if not relevant_docs:
                    st.warning("⚠️ No relevant information found in the handbook.")
                    return
                
                # Generate answer with XAI
                start_time = time.time()
                answer = generate_answer_with_xai(user_input, relevant_docs, xai_client)
                generation_time = time.time() - start_time
                
                # Display answer
                st.markdown(answer)
                
                # Show performance
                st.caption(f"⚡ Search: {search_time:.2f}s | Generation: {generation_time:.2f}s")
                
                # Add to chat history
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": answer,
                    "sources": relevant_docs[:3]  # Store top 3 sources
                })
                
                # Show sources
                with st.expander(f"📚 Sources ({len(relevant_docs)} found)"):
                    for i, source in enumerate(relevant_docs, 1):
                        score = source.get('score', 0)
                        page = source.get('metadata', {}).get('page', 'N/A') 
                        content = source.get('content', '')[:300] + "..."
                        
                        st.markdown(f"""
                        **Source {i}** (Score: {score:.3f}, Page: {page})
                        
                        *{content}*
                        """)

    # Footer
    st.markdown("---")
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col1:
        if st.button("🗑️ Clear Chat"):
            st.session_state.messages = []
            st.rerun()
    
    with col2:
        st.markdown("*Using real Ontario Driver's Handbook data*")
    
    with col3:
        st.markdown(f"**{len(documents) if documents else 0}** handbook sections")

if __name__ == "__main__":
    main()