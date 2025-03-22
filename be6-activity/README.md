# One time setup. 
python3 -m venv alogger
source ~/alogger/bin/activate

cd ~/child-apps/activitylogging-main/server
pip install -r requirements.txt

# How to Start the server

source ~/alogger/bin/activate
cd ~/vj-servers/frontend/fe6-activity
python3 app.py

# Testing
Server starts at port

 * Running on http://127.0.0.1:6030
 * Running on http://10.45.8.187:6030


