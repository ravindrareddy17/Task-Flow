import streamlit as st
import streamlit.components.v1 as components
import subprocess
import os
import time
import socket

st.set_page_config(page_title="TaskFlow Launcher", layout="wide")

st.title("🚀 TaskFlow Collaborative Platform")
st.markdown("---")

# 1. Start the Node server in the background if it's not already running
def start_node_server():
    if not hasattr(st, 'server_started'):
        st.info("Starting TaskFlow Backend Server...")
        try:
            # Change to your server directory
            os.chdir("server")
            subprocess.Popen(["node", "server.js"], env=os.environ)
            os.chdir("..")
            st.server_started = True
            st.success("Backend server initiated!")
            time.sleep(5) # Give it time to start
        except Exception as e:
            st.error(f"Failed to start backend: {e}")

# 2. Display the App
# IMPORTANT: In local streamlit, this would be localhost:5173
# In production Streamlit Cloud, you would typically provide your 
# specific Render/Vercel URL here for the most stable experience.
deploy_url = st.text_input("Production App URL (Optional)", placeholder="https://your-app.render.com")

if deploy_url:
    components.iframe(deploy_url, height=800, scrolling=True)
else:
    st.warning("Please provide your production URL above to view the app, or run locally.")
    st.markdown("""
    ### How to deploy this MERN app properly:
    1. **Backend**: Deploy the `server/` folder to [Render](https://render.com) or [Railway](https://railway.app).
    2. **Frontend**: Deploy the `client/` folder to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
    3. **Paste the URL**: Once deployed, paste your frontend URL in the box above to use this Streamlit wrapper.
    """)

st.sidebar.title("TaskFlow System")
st.sidebar.info("This is a Streamlit wrapper for a MERN stack application.")
st.sidebar.markdown("[View Source on GitHub](https://github.com/ravindrareddy17/Task-Flow)")
