import streamlit as st
import requests
import json
from datetime import datetime

# Configure the page
st.set_page_config(
    page_title="MTO RAG - Ontario Driving Assistant",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Backend API URL
API_BASE_URL = "https://ontario-driving-rag.onrender.com/api"

def main():
    st.title("🚗 MTO RAG - Ontario Driving Assistant")
    st.markdown("Ask questions about Ontario driving rules and regulations!")

    # Sidebar
    with st.sidebar:
        st.header("📊 Quick Stats")
        
        # Try to get stats from backend
        try:
            response = requests.get(f"{API_BASE_URL}/rag/stats", timeout=10)
            if response.status_code == 200:
                stats = response.json()
                if stats.get('success'):
                    data = stats['data']
                    st.metric("Total Queries", data.get('totalQueries', 0))
                    st.metric("Avg Query Time", f"{data.get('averageQueryTime', 0):.0f}ms")
                    st.metric("System Health", data.get('systemHealth', 'unknown').title())
                else:
                    st.warning("Could not load stats")
            else:
                st.warning("Backend not available")
        except Exception as e:
            st.warning("Backend not available")

        st.markdown("---")
        st.markdown("### 💡 Sample Questions")
        sample_questions = [
            "What is the speed limit on highways in Ontario?",
            "What documents do I need for a G1 test?",
            "Can G1 drivers drive on 400-series highways?", 
            "What is the blood alcohol limit for drivers?",
            "What should you do when a school bus has flashing red lights?"
        ]
        
        for question in sample_questions:
            if st.button(question, key=f"sample_{hash(question)}"):
                st.session_state.user_question = question

    # Main chat interface
    col1, col2 = st.columns([3, 1])
    
    with col1:
        # Chat messages
        if "messages" not in st.session_state:
            st.session_state.messages = []

        # Display chat messages
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])
                if message["role"] == "assistant" and "sources" in message:
                    with st.expander("📚 Sources"):
                        for i, source in enumerate(message["sources"], 1):
                            st.markdown(f"**Source {i}** (Page {source['page']}, Score: {source['score']:.2f})")
                            st.markdown(f"*{source['content'][:200]}...*")

        # Chat input
        user_question = st.chat_input("Ask a question about Ontario driving...")
        
        # Handle sample question from sidebar  
        if "user_question" in st.session_state:
            user_question = st.session_state.user_question
            del st.session_state.user_question

        if user_question:
            # Add user message
            st.session_state.messages.append({"role": "user", "content": user_question})
            
            with st.chat_message("user"):
                st.markdown(user_question)

            # Get response from backend
            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    try:
                        response = requests.post(
                            f"{API_BASE_URL}/rag/query",
                            json={"question": user_question},
                            timeout=60
                        )
                        
                        if response.status_code == 200:
                            result = response.json()
                            if result.get('success'):
                                data = result['data']
                                answer = data['answer']
                                sources = data.get('sources', [])
                                
                                st.markdown(answer)
                                
                                # Add assistant message with sources
                                st.session_state.messages.append({
                                    "role": "assistant", 
                                    "content": answer,
                                    "sources": sources
                                })
                                
                                # Show sources
                                if sources:
                                    with st.expander("📚 Sources"):
                                        for i, source in enumerate(sources, 1):
                                            st.markdown(f"**Source {i}** (Page {source['page']}, Score: {source['score']:.2f})")
                                            st.markdown(f"*{source['content'][:200]}...*")
                            else:
                                error_msg = "Sorry, I couldn't process your question."
                                st.error(error_msg)
                                st.session_state.messages.append({"role": "assistant", "content": error_msg})
                        else:
                            error_msg = f"Backend error: {response.status_code}"
                            st.error(error_msg)
                            st.session_state.messages.append({"role": "assistant", "content": error_msg})
                            
                    except requests.exceptions.Timeout:
                        error_msg = "Request timed out. Please try again."
                        st.error(error_msg)
                        st.session_state.messages.append({"role": "assistant", "content": error_msg})
                    except Exception as e:
                        error_msg = f"Error: {str(e)}"
                        st.error(error_msg)
                        st.session_state.messages.append({"role": "assistant", "content": error_msg})

    with col2:
        st.markdown("### 🎯 Categories")
        try:
            response = requests.get(f"{API_BASE_URL}/rag/categories", timeout=10)
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    categories = result['data']
                    for category in categories:
                        st.badge(category)
                else:
                    st.info("Categories not available")
            else:
                st.info("Categories not available")
        except:
            st.info("Categories not available")

        st.markdown("---")
        
        # Clear chat button
        if st.button("🗑️ Clear Chat", type="secondary"):
            st.session_state.messages = []
            st.rerun()

if __name__ == "__main__":
    main()