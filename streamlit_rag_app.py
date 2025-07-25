#!/usr/bin/env python3
"""
Streamlit RAG App - Using our actual RAG engine
"""

import streamlit as st
import sys
import os
import time
from pathlib import Path

# Add current directory to path to import rag_engine
sys.path.append(str(Path(__file__).parent))

try:
    from rag_engine import OptimizedEnhancedRAG
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False

# Configure the page
st.set_page_config(
    page_title="MTO RAG - Ontario Driving Assistant",
    page_icon="🚗",
    layout="wide"
)

@st.cache_resource
def initialize_rag():
    """Initialize RAG system once and cache it"""
    if not RAG_AVAILABLE:
        return None
    
    try:
        with st.spinner("🚀 Initializing RAG system..."):
            rag = OptimizedEnhancedRAG()
            rag.setup()
            return rag
    except Exception as e:
        st.error(f"Failed to initialize RAG: {str(e)}")
        return None

def query_rag(rag_system, question):
    """Query the RAG system"""
    if not rag_system:
        return {
            "answer": "RAG system is not available. Please check your setup.",
            "relevant_chunks": [],
            "query_time": 0
        }
    
    try:
        start_time = time.time()
        result = rag_system.optimized_query(question)
        query_time = time.time() - start_time
        
        # Add query time to result
        result["query_time"] = query_time
        return result
        
    except Exception as e:
        return {
            "answer": f"Error processing query: {str(e)}",
            "relevant_chunks": [],
            "query_time": 0
        }

def main():
    st.title("🚗 MTO RAG - Ontario Driving Assistant")
    st.markdown("*Powered by AI and official Ontario Driver's Handbook*")
    
    # Initialize RAG system
    rag_system = initialize_rag()
    
    # Sidebar
    with st.sidebar:
        st.header("🎯 System Status")
        
        if rag_system:
            st.success("✅ RAG System Online")
            st.info("🤖 Using: Grok AI + ChromaDB")
        else:
            st.error("❌ RAG System Offline")
            st.warning("Check configuration and API keys")
        
        st.markdown("---")
        
        st.header("💡 Sample Questions")
        sample_questions = [
            "How do I get my G1 license in Ontario?",
            "What are the speed limits on highways?", 
            "Can I drink alcohol while driving?",
            "What should I do when a school bus has flashing red lights?",
            "Can G1 drivers use 400-series highways?",
            "What are the penalties for speeding?",
            "How long do I have to hold my G1 before getting G2?",
            "What documents do I need for my driving test?"
        ]
        
        for question in sample_questions:
            if st.button(question, key=f"sample_{hash(question)}"):
                st.session_state.preset_question = question
        
        st.markdown("---")
        
        # Performance stats
        if "total_queries" not in st.session_state:
            st.session_state.total_queries = 0
            st.session_state.total_time = 0
        
        st.header("📊 Performance")
        st.metric("Total Queries", st.session_state.total_queries)
        
        if st.session_state.total_queries > 0:
            avg_time = st.session_state.total_time / st.session_state.total_queries
            st.metric("Avg Response Time", f"{avg_time:.2f}s")
        
        # Clear stats button
        if st.button("🔄 Reset Stats"):
            st.session_state.total_queries = 0
            st.session_state.total_time = 0
            st.rerun()

    # Main chat interface
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            
            # Show sources for assistant messages
            if message["role"] == "assistant" and "sources" in message:
                if message["sources"]:
                    with st.expander(f"📚 Sources ({len(message['sources'])} found)"):
                        for i, source in enumerate(message["sources"], 1):
                            score = source.get("score", 0)
                            page = source.get("page", "N/A")
                            content = source.get("content", "")[:200] + "..."
                            
                            st.markdown(f"""
                            **Source {i}** (Score: {score:.3f}, Page: {page})
                            
                            *{content}*
                            """)
            
            # Show query performance
            if message["role"] == "assistant" and "query_time" in message:
                st.caption(f"⚡ Responded in {message['query_time']:.2f} seconds")

    # Handle preset question from sidebar
    user_input = None
    if "preset_question" in st.session_state:
        user_input = st.session_state.preset_question
        del st.session_state.preset_question

    # Chat input
    if not user_input:
        user_input = st.chat_input("Ask me anything about Ontario driving laws...")

    if user_input:
        # Add user message
        st.session_state.messages.append({"role": "user", "content": user_input})
        
        with st.chat_message("user"):
            st.markdown(user_input)

        # Get RAG response
        with st.chat_message("assistant"):
            if not rag_system:
                st.error("❌ RAG system is not available. Please check your configuration.")
                return
                
            with st.spinner("🧠 Processing your question..."):
                # Query RAG system
                result = query_rag(rag_system, user_input)
                
                # Update performance stats
                st.session_state.total_queries += 1
                st.session_state.total_time += result.get("query_time", 0)
                
                # Display answer
                answer = result.get("answer", "Sorry, I couldn't generate an answer.")
                st.markdown(answer)
                
                # Prepare sources for display
                sources = []
                relevant_chunks = result.get("relevant_chunks", [])
                
                for chunk in relevant_chunks:
                    source_info = {
                        "content": chunk.get("content", ""),
                        "page": chunk.get("metadata", {}).get("page", "N/A"),
                        "score": chunk.get("final_score", chunk.get("score", 0))
                    }
                    sources.append(source_info)
                
                # Show sources
                if sources:
                    with st.expander(f"📚 Sources ({len(sources)} found)"):
                        for i, source in enumerate(sources, 1):
                            score = source["score"]
                            page = source["page"]
                            content = source["content"][:200] + "..." if len(source["content"]) > 200 else source["content"]
                            
                            st.markdown(f"""
                            **Source {i}** (Score: {score:.3f}, Page: {page})
                            
                            *{content}*
                            """)
                
                # Show performance
                query_time = result.get("query_time", 0)
                st.caption(f"⚡ Responded in {query_time:.2f} seconds")
                
                # Add to chat history
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": answer,
                    "sources": sources,
                    "query_time": query_time
                })

    # Footer
    st.markdown("---")
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col1:
        if st.button("🗑️ Clear Chat"):
            st.session_state.messages = []
            st.rerun()
    
    with col2:
        st.markdown("*Powered by Grok AI and ChromaDB*")
    
    with col3:
        if st.button("📊 View Stats"):
            st.info(f"Total queries: {st.session_state.total_queries}")

if __name__ == "__main__":
    main()