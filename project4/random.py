import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = os.path.join(BASE_DIR, 'static')
print(s)