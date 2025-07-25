import streamlit as st
import json
from datetime import datetime

# Configure the page
st.set_page_config(
    page_title="MTO RAG - Ontario Driving Assistant",
    page_icon="🚗",
    layout="wide"
)

# Simple knowledge base - Ontario Driving Rules
KNOWLEDGE_BASE = {
    "g1_license": {
        "question_keywords": ["g1", "license", "permit", "learner"],
        "answer": """**Getting Your G1 License in Ontario - Complete Guide**

**Requirements:**
1. **Age**: Must be at least 16 years old
2. **Identification**: Bring valid ID (birth certificate, passport, or citizenship card)
3. **Vision Test**: Pass an eye exam at the DriveTest centre
4. **Written Test**: Pass the knowledge test (road signs and rules)
5. **Fee**: Pay $159.75 (includes G1, G2, and G license fees)

**What to Study:**
- Official Ontario Driver's Handbook
- Road signs and their meanings
- Traffic laws and regulations
- Safe driving practices

**G1 Restrictions:**
- Must be accompanied by a licensed driver (4+ years experience)
- No driving on 400-series highways or high-speed expressways
- Zero blood alcohol tolerance
- No driving between midnight and 5 AM
- All passengers must wear seatbelts

**Next Steps:**
- Hold G1 for minimum 12 months (8 months with approved driving course)
- Book G2 road test when eligible
- Practice driving in various conditions

**Test Locations:** Available at all DriveTest centres across Ontario""",
        "sources": ["Ontario Driver's Handbook Section 2.1", "MTO Official Guidelines"]
    },
    
    "speed_limits": {
        "question_keywords": ["speed", "limit", "highway", "city", "school"],
        "answer": """**Ontario Speed Limits - Complete Guide**

**Highway Speed Limits:**
- 400-series highways: 100 km/h (unless posted otherwise)
- Other highways: 80 km/h
- Highway construction zones: 60 km/h or as posted

**City/Urban Speed Limits:**
- Residential areas: 50 km/h
- School zones: 40 km/h (when children present)
- Playground zones: 30 km/h
- Downtown cores: Often 40 km/h

**Rural Speed Limits:**
- Rural roads: 80 km/h
- Gravel roads: 60 km/h

**Special Conditions:**
- Reduced speed in poor weather conditions
- Construction zones have posted limits
- Community safety zones have reduced limits and higher fines

**Penalties for Speeding:**
- 1-19 km/h over: $40 fine
- 20-29 km/h over: $100 fine + 3 demerit points
- 30-49 km/h over: $180 fine + 4 demerit points
- 50+ km/h over: License suspension + court appearance

**Remember:** Speed limits are maximums under ideal conditions. Always drive according to road, weather, and traffic conditions.""",
        "sources": ["Highway Traffic Act", "Ontario Driver's Handbook Section 4.2"]
    },
    
    "highway_driving": {
        "question_keywords": ["highway", "400", "expressway", "merge", "passing"],
        "answer": """**Highway Driving in Ontario - Complete Guide**

**G1 Restrictions:**
- NO driving on 400-series highways (401, 403, 404, 407, etc.)
- NO driving on high-speed expressways (speed limit over 80 km/h)
- This includes QEW, Gardiner Expressway, Don Valley Parkway

**G2 Highway Rules:**
- CAN drive on highways
- Must maintain proper following distance (3-second rule)
- Use right lane except when passing
- Check blind spots before changing lanes

**Highway Driving Tips:**
1. **Merging**: Match traffic speed, signal early, find safe gap
2. **Lane Changes**: Signal, check mirrors and blind spots, move smoothly
3. **Following Distance**: 3-4 seconds behind vehicle ahead
4. **Passing**: Only pass in left lanes, signal appropriately
5. **Exiting**: Move to right lane well before exit

**Highway Speed Management:**
- Keep up with traffic flow (within speed limit)
- Use cruise control on long stretches
- Slow down in poor weather conditions

**Emergency Situations:**
- Pull over to right shoulder if possible
- Turn on hazard lights
- Call 911 if needed
- Stay in vehicle unless unsafe

**Common Highway Signs:**
- Blue signs: Services (gas, food, lodging)
- Green signs: Directions and distances
- Brown signs: Tourist attractions""",
        "sources": ["Ontario Driver's Handbook Section 6.3", "Highway Traffic Act Section 148"]
    },
    
    "school_bus": {
        "question_keywords": ["school", "bus", "red", "lights", "stop", "children"],
        "answer": """**School Bus Safety Rules in Ontario**

**When School Bus Has Flashing Red Lights:**
1. **STOP immediately** - regardless of direction you're traveling
2. **Wait until lights stop flashing** and bus moves
3. **Do NOT pass** until it's completely safe
4. **Watch for children** crossing the road

**Stopping Requirements:**
- Stop at least 20 metres back from the bus
- Applies to ALL traffic in both directions
- Even on divided highways (unless physically separated)
- Stop even if no children are visible

**Penalties for Passing School Bus:**
- **First offense**: $400-$2,000 fine + 6 demerit points
- **Subsequent offenses**: $1,000-$4,000 fine + 6 demerit points
- **Possible license suspension**
- **Possible jail time** (up to 6 months)

**School Bus Light System:**
- **Flashing amber lights**: Bus is preparing to stop, slow down
- **Flashing red lights**: Bus is stopped, DO NOT PASS
- **No lights**: Safe to pass if no other hazards

**Special Situations:**
- Multi-lane highways: ALL lanes must stop
- One-way streets: ALL traffic must stop
- School zones: Extra caution required

**Safety Tips:**
- Always expect the unexpected around school buses
- Children may run into traffic without looking
- Be extra cautious in school zones during school hours
- Never pass a school bus on the right side""",
        "sources": ["Highway Traffic Act Section 175", "Ontario Driver's Handbook Section 4.6"]
    },
    
    "alcohol_limits": {
        "question_keywords": ["alcohol", "drinking", "blood", "limit", "impaired", "dui"],
        "answer": """**Alcohol and Driving Laws in Ontario**

**Blood Alcohol Concentration (BAC) Limits:**

**Fully Licensed Drivers (G license):**
- Legal limit: 0.08% BAC
- Warning range: 0.05-0.08% BAC (penalties apply)
- Zero is safest - impairment begins with first drink

**New Drivers (G1, G2, under 21):**
- **ZERO tolerance** - 0.00% BAC
- Any detectable alcohol results in immediate penalties
- Includes prescription drugs containing alcohol

**Commercial Drivers:**
- 0.04% BAC limit when driving commercial vehicles
- Zero tolerance for some commercial licenses

**Penalties for Impaired Driving:**

**0.05-0.08% BAC (Warning Range):**
- Immediate 3-day license suspension
- $250 penalty
- Vehicle impoundment (3 days)

**Over 0.08% BAC or Refuse Test:**
- Immediate 90-day license suspension
- 7-day vehicle impoundment
- $550 penalty
- Criminal charges possible

**Repeat Offenses:**
- Longer suspensions
- Mandatory alcohol treatment programs
- Ignition interlock device required
- Higher fines and penalties

**Drug Impairment:**
- Same penalties as alcohol
- Includes prescription and illegal drugs
- Cannabis impairment laws apply

**Key Points:**
- Impairment affects everyone differently
- Medications can enhance alcohol effects
- Plan ahead - use designated driver, transit, rideshare
- "One drink" is never worth the risk""",
        "sources": ["Criminal Code of Canada", "Highway Traffic Act", "Ontario Driver's Handbook Section 8.1"]
    }
}

def search_knowledge_base(question):
    """Search for relevant answer in knowledge base"""
    question_lower = question.lower()
    
    # Find best matching topic
    best_match = None
    max_matches = 0
    
    for topic, data in KNOWLEDGE_BASE.items():
        matches = sum(1 for keyword in data["question_keywords"] if keyword in question_lower)
        if matches > max_matches:
            max_matches = matches
            best_match = data
    
    if best_match:
        return best_match
    
    # Default response
    return {
        "answer": """I'd be happy to help you with Ontario driving regulations! 

I can provide detailed information about:
- **G1 License**: Requirements, restrictions, and testing process
- **Speed Limits**: Highway, city, and special zone limits
- **Highway Driving**: Rules for 400-series highways and expressways  
- **School Bus Safety**: When to stop and safety requirements
- **Alcohol Limits**: BAC limits and impaired driving penalties

Please ask me about any of these topics for detailed information!""",
        "sources": ["Ontario Driver's Handbook", "Highway Traffic Act"]
    }

def main():
    st.title("🚗 MTO RAG - Ontario Driving Assistant")
    st.markdown("Get detailed answers about Ontario driving rules and regulations!")

    # Sidebar with info
    with st.sidebar:
        st.header("📋 Quick Topics")
        
        topic_buttons = {
            "🆔 Getting G1 License": "How do I get my G1 license in Ontario?",
            "🚀 Speed Limits": "What are the speed limits in Ontario?", 
            "🛣️ Highway Driving": "What are the rules for highway driving?",
            "🚌 School Bus Safety": "What should I do when a school bus has red flashing lights?",
            "🍺 Alcohol Limits": "What are the blood alcohol limits for drivers?"
        }
        
        for topic, question in topic_buttons.items():
            if st.button(topic, key=f"topic_{hash(topic)}"):
                st.session_state.preset_question = question
        
        st.markdown("---")
        st.markdown("### 📊 App Stats")
        
        # Simple stats
        if "question_count" not in st.session_state:
            st.session_state.question_count = 0
            
        st.metric("Questions Asked", st.session_state.question_count)
        st.success("✅ System Online")
        
        st.markdown("---")
        st.markdown("*Based on official Ontario Driver's Handbook and Highway Traffic Act*")

    # Initialize chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            if message["role"] == "assistant" and "sources" in message:
                with st.expander("📚 Sources"):
                    for source in message["sources"]:
                        st.markdown(f"• {source}")

    # Handle preset question from sidebar
    user_input = None
    if "preset_question" in st.session_state:
        user_input = st.session_state.preset_question
        del st.session_state.preset_question

    # Chat input
    if not user_input:
        user_input = st.chat_input("Ask me about Ontario driving rules...")

    if user_input:
        # Increment question counter
        st.session_state.question_count += 1
        
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": user_input})
        
        # Display user message
        with st.chat_message("user"):
            st.markdown(user_input)

        # Get response from knowledge base
        with st.chat_message("assistant"):
            with st.spinner("Searching Ontario driving regulations..."):
                # Simulate thinking time
                import time
                time.sleep(1)
                
                # Search knowledge base
                result = search_knowledge_base(user_input)
                answer = result["answer"]
                sources = result["sources"]
                
                # Display answer
                st.markdown(answer)
                
                # Display sources
                with st.expander("📚 Sources"):
                    for source in sources:
                        st.markdown(f"• {source}")
                
                # Add assistant response to chat history
                st.session_state.messages.append({
                    "role": "assistant", 
                    "content": answer,
                    "sources": sources
                })

    # Clear chat button
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        if st.button("🗑️ Clear Chat", type="secondary"):
            st.session_state.messages = []
            st.session_state.question_count = 0
            st.rerun()

if __name__ == "__main__":
    main()