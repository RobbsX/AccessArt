<h2 align="center">AccessArt</h2>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#storing-and-getting-data-from-solid-pods">Storing and Getting Data from Solid Pods</a></li>
    <li><a href="#results">Results</a></li>
    <li><a href="#general-issues-encountered">General issues encountered</a></li>
    <li><a href="#future-work">Future Work</a></li>
    <li><a href="#contacts">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About the Project

_Is creating a decentralized application a **viable** alternative to centralized?_\
The goal is to find out how complicated it is building an application using the SOLID project. 

The application in a nutshell: A webapp that shows users artworks of Victoria & Alberthall Museum using their well-maintained API. 

The Victoria and Alberthall Museum API has great [documentation](https://developers.vam.ac.uk/guide/v2/welcome.html) and examples on [their Github](https://github.com/vanda/etc-docs) while following API standards, making it ideal for this use case. 

<img width="800" alt="Mockup image" src="https://github.com/RobbsX/AccessArt/assets/79597633/bd333805-8135-44a3-a2f2-a020eaad173e">
\This is a mockup image of the structure of the AccessArt Solid Application that is being built in this project. 



<!-- MOTIVATION -->
## Motivation

These days, apps use a centralised data storage. This enables ~97% Uptime, efficient storage, and creates a viable business model. However, this also has some drawbacks: 
- Your OWN data is not freely available to you
- Data Leaks (massive expenses for companies)
- Legal Issues (GDPR)

However, users could also store their data themselves. The founder of the web, Sir Tim Berners-Lee, founded the [Solid project](https://solidproject.org) that enables users to have control over their data by storing it on their own Pod. This Pod can be your own server, or you use a trusted third-party. 

Sounds interesting? Right! But how does the developer side of creating a Solid Application look like? That's what we try to figure out!

<!-- GETTING STARTED -->
## Getting Started 

The best place to start with Solid Apps in general is explained well on the official [Solid webpage](https://solidproject.org/developers/tutorials/getting-started). This however for basic developement quickly lead to reading actual Pods and developer documentation which is provided mainly by the [Inrupt documentation](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/getting-started/). 

There, it is explained where and how to get a Solid Pod that is hosted by Inrupt (the Pod provider). This allows you to get a WebID which acts like a username for your Pod. 

In generall for basic reproducability we suggest following the steps in the Inrupt documentation. 

### Prerequisites
This is taken from the Inrupt documentation mentioned above. 
If you do not already have npm installed, install npm. npm is installed as part of the Node.js installation.
Inrupt's Javascript Client libraries support Active/Maintenance LTS releases for Node.js.


### Installation
The app assumes npm installed and uses [webpack](https://webpack.js.org/guides/getting-started/) to run the application locally on http://localhost:8080/. Use npm to install Webpack packages: 
```sh
npm install webpack webpack-cli webpack-dev-server css-loader style-loader --save-dev
```

To let it run:
```sh
npm run build && npm run start
```
Note: You might run into errors if `npm install` did not properly install all necessay packages. The easy solution is to delete the node_modules folder and reinstall all using `npm install`. 


<!-- STORING AND GETTING DATA FROM SOLID PODS -->
### Storing and Getting Data from Solid Pods
Pods in general act like a cloud where files and data stored in any format can be accessed using the WebID and PodURL. The idea being, that the Pod can be hosted on user devices for a hightend privacy. [Setting them up using Pod Providers such as Inrupt](https://start.inrupt.com/profile) is as easy as logging in to any app - with the result being a profile (WebID) that can be used at any of the Solid Apps. 

Coding and developing with persitent data storage usually accoring to CRUD. We have listed the functions Inrupt Pods provide out-of-the-box that we used:
Create: createThing 
Read: getThing(All) as 
Update: ? 
Delete: Easy to delete the whole SOLID dataset

Updating Pods is a bit of a challenge as no real documentation for this is provided. 

We use Create and Read to implement the function that allows to check if a user has already seen a picture. The "watched" data is stored in RDF on the Pod (decentralized) and then read whenever a user connects a Pod to check if the next viewable image is already seen. This is implemented in the "MySeenList" which also appears in localhost on the front-end to help debug storage issues, as well as API issues. 


<!-- RESULTS -->
## Results

The final result is best described in a picture:

![AA_localhost](https://github.com/RobbsX/AccessArt/assets/82062860/fcb37eec-8c0f-4d29-8fd2-e913bb0259af)

The app allows a user to connect his Solid Pod through the WebID with Inrupt. The login and Pod connection process is automated, so the user only has to allow the webapp to access the Inrupt Pod. All data that is generated by the user on the webapp is then stored there. 

The VA Museum API allows us to query a number of pictures and their metadata, which we display front and center. The next function allows to cycle through pictures, while also allowing us to store that a picture has already been seen and there won't show up. 

For developement sake we have a "MySeenList" which allowed us to debug storing and changing data in the user Pod. 
The practicality of the reading and writing to Pod with RDF data is limited as a lot of time has to be spent understanding the format that allows data to be stored on the Pod. 

<!-- GENERAL ISSUES ENCOUNTERED -->
## General issues encountered 

A big conceptual issue is decentralizing information that is stored on Pods and then connecting them all on a webapp. The Like button information would - in Solid theory - have to be stored on user Pods and then upon opening, requested by all Pods who liked that image.  
This relates to issues with linked data on apps using RDF is written on articles such as [this](https://ontola.io/blog/full-stack-linked-data), where especially no ready solution is available to overcome the slowness that comes with loading all URL/URIs of the ressources in the background. 

The way other web apps, especially [Solid Apps](https://solidproject.org/apps) go around solving this is by simply "caching" a lot of the data that is required to be central for a webapp to be efficient as of now. 

We also dealt with other Solid Pod specific challenges, namely updating Pod storage information. 
There is a confusion between Inrupt.net and Inrupt.com. Both provide a Pod but they are not cross-compatible leading to confusion. 

Overall we would welcome if the information on accessing ressources on Pods got simplified. A lot of time has to be spent on understanding Pod specific storage sturcture for reading the data. \
We would also welcome if more _working_ tutorials would be provided, that are still easy to understand but can give a sense what is possible with Pods. That is not to say there are no simple to follow [showcase examples](https://github.com/0dataapp/hello/tree/main/solid). The [available open-source apps](https://solidproject.org/apps) that use the Solid framework are helpful when trying to understand the code basis, but often cannot be followed. 

Specifically: Showing how a decentralized collection of Pod information can be brought together would result in an easier to develop webapp. For us this would have been nice to connect "Likes" information of Users and display the number of users who liked a picture for example. 
We also did [ask this in the Solid Forum](https://forum.solidproject.org/t/accessing-other-pods-public-data-like-button/6691) to try and get help but suggested solution did not fit the use-case. 

<!-- FUTURE WORK -->
## Future Work
Things that we could not manage due to lack of time or lack of assisting code/documentation/tutorials:

- Make function to button (dis)like click. Save (Dis)Like to Users Pod.
- Enable decentralized like function
- Enable seeing what pods liked this picture.

<!-- CONTACTS -->
## Contacts

Robin Kulha - h11838239@s.wu.ac.at -  [https://github.com/RobbsX](https://github.com/RobbsX)

Maroan El Sirfy - h11839876@s.wu.ac.at - [https://github.com/maroan-ls](https://github.com/maroan-ls)

Project Link: [https://github.com/RobbsX/AccessArt](https://github.com/RobbsX/AccessArt)

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
We want to thank Professor Dr Sabrina Kirrane at WU Wien for allowing us to conduct this project as part of her Data Science Masters's course. 
