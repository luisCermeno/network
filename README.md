# Project 4 "Network"
Author: Luis Cermeno
Project4 for **Harvard's CS50**

Twitter-like social network website for making posts and following users.


## TO RUN IN DOCKER CONTAINER

1. Run:  
`docker pull luiscermeno/network`  
`docker run -p 8000:8000 luiscermeno/network`

2. Go to "localhost/8000" in your web browser

You can also replace the port in which the app will run. For this, have the docker image map the vm port to the port of your selection:  
`docker run -p [PORT]:8000 luiscermeno/network`  


## Runtime
python=3.10.4
