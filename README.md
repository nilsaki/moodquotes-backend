##Introduction
The Mood Based Quote Generator is a full-stack web application designed to deliver emotionally relevant quotes based on the user’s current mood.
The project combines frontend design, backend development, and cloud deployment to create a real-world, publicly accessible application. 
Beyond basic functionality, the project emphasizes user experience through visual effects, animations, and adaptive color themes.

##System Architecture Overview
The system follows a client-server architecture. The frontend is implemented as a static web application using HTML, CSS, and JavaScript.
It communicates with a backend REST API developed using Node.js and Express.js. User authentication data is stored in a PostgreSQL database.
All components are deployed on cloud platforms, enabling access from any device without dependence on the developer’s local machine.

##Frontend Design and User Interface
The frontend focuses heavily on visual storytelling. Each mood is represented by a distinct color palette and animation style.
For example, love-related moods use warm tones and floating heart animations, while sad moods use cooler colors and falling rain effects.
Glassmorphism principles were applied to cards and buttons to create a modern and soft interface. The interface was tested across different devices to ensure responsiveness.

##Backend Logic and Security
The backend is responsible for user registration and login operations. Passwords are securely hashed using bcrypt before being stored in the database.
Environment variables are used to store sensitive information such as database connection strings. This approach ensures that credentials are not exposed in the source code.

##Data Management and Storage
User credentials are stored persistently in a PostgreSQL database. Additional interactive features such as comments, likes, and favorites are stored locally using browser localStorage.
This hybrid approach reduces backend complexity while still offering personalized user interaction.

##Deployment and Cloud Infrastructure
The frontend is deployed as a static site on InfinityFree, while the backend runs as a web service on Render. 
The backend connects to a managed PostgreSQL database using a secure connection string.
Once deployed, the system runs continuously on cloud servers, independent of local development tools such as VS Code.



