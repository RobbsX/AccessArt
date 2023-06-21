// Import from "@inrupt/solid-client-authn-browser"
import {
    login,
    handleIncomingRedirect,
    getDefaultSession,
    fetch
} from "@inrupt/solid-client-authn-browser";

  
// Import from "@inrupt/solid-client"
import {
  addUrl,
  addStringNoLocale,
  createSolidDataset,
  createThing,
  getPodUrlAll,
  getSolidDataset,
  getThingAll,
  getStringNoLocale,
  removeThing,
  saveSolidDatasetAt,
  setThing,
  deleteSolidDataset
} from "@inrupt/solid-client";

import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

const selectorIdP = document.querySelector("#select-idp");
const selectorPod = document.querySelector("#select-pod");
const buttonLogin = document.querySelector("#btnLogin");
const buttonRead = document.querySelector("#btnRead");
const buttonCreate = document.querySelector("#btnCreate");
const labelCreateStatus = document.querySelector("#labelCreateStatus");

buttonRead.setAttribute("disabled", "disabled");
// buttonLogin.setAttribute("disabled", "disabled");
// buttonCreate.setAttribute("disabled", "disabled");

// 1a. Start Login Process. Call login() function.
function loginToSelectedIdP() {
  const SELECTED_IDP = document.getElementById("select-idp").value;

  return login({
    oidcIssuer: SELECTED_IDP,
    redirectUrl: window.location.href,
    clientName: "Getting started app"
  });
}

// 1b. Login Redirect. Call handleIncomingRedirect() function.
// When redirected after login, finish the process by retrieving session information.
async function handleRedirectAfterLogin() {
  await handleIncomingRedirect();

  const session = getDefaultSession();
  if (session.info.isLoggedIn) {
    // Update the page with the status.
    document.getElementById("myWebID").value = session.info.webId;

    // Enable Read button to read Pod URL
    buttonRead.removeAttribute("disabled");

    // Get Pod URL(s) associated with the WebID
    getMyPods();
  }
}

// The example has the login redirect back to the index.html.
// This calls the function to process login information.
// If the function is called when not part of the login redirect, the function is a no-op.
handleRedirectAfterLogin();

// 2. Get Pod(s) associated with the WebID
async function getMyPods() {
  const webID = document.getElementById("myWebID").value;
  const mypods = await getPodUrlAll(webID, { fetch: fetch });

  // Check if only one Pod is associated with the WebID
  if (mypods.length === 1) {
    let podOption = document.createElement("option");
    podOption.textContent = mypods[0];
    podOption.value = mypods[0];
    selectorPod.appendChild(podOption);
    document.getElementById("select-pod").value = mypods[0];
  } else {
    // If more than one Pod is associated with the WebID, display a selector
    // to allow the user to choose which Pod to use.
    mypods.forEach((mypod) => {
      let podOption = document.createElement("option");
      podOption.textContent = mypod;
      podOption.value = mypod;
      selectorPod.appendChild(podOption);
    });
  } 
}

// 3. Create the Reading List
async function createList() {
  labelCreateStatus.textContent = "";
  const SELECTED_POD = document.getElementById("select-pod").value;

  // For simplicity and brevity, this tutorial hardcodes the  SolidDataset URL.
  // In practice, you should add in your profile a link to this resource
  // such that applications can follow to find your list.
  const readingListUrl = `${SELECTED_POD}getting-started/readingList/myList`;

  let titles = document.getElementById("titles").value.split("\n");

  // Fetch or create a new reading list.
  let myReadingList;

  try {
    // Attempt to retrieve the reading list in case it already exists.
    myReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
    // Clear the list to override the whole list
    let items = getThingAll(myReadingList);
    items.forEach((item) => {
      myReadingList = removeThing(myReadingList, item);
    });
  } catch (error) {
    if (typeof error.statusCode === "number" && error.statusCode === 404) {
      // if not found, create a new SolidDataset (i.e., the reading list)
      myReadingList = createSolidDataset();
    } else {
      console.error(error.message);
    }
  }

  // Add titles to the Dataset
  let i = 0;
  titles.forEach((title) => {
    if (title.trim() !== "") {
      let item = createThing({ name: "title" + i });
      item = addUrl(item, RDF.type, AS.Article);
      item = addStringNoLocale(item, SCHEMA_INRUPT.name, title);
      myReadingList = setThing(myReadingList, item);
      i++;
    }
  });

  try {
    // Save the SolidDataset
    let savedReadingList = await saveSolidDatasetAt(
      readingListUrl,
      myReadingList,
      { fetch: fetch }
    );

    labelCreateStatus.textContent = "Saved";

    // Refetch the Reading List
    savedReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });

    let items = getThingAll(savedReadingList);

    let listcontent = "";
    for (let i = 0; i < items.length; i++) {
      let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
      if (item !== null) {
        listcontent += item + "\n";
      }
    }

    document.getElementById("savedtitles").value = listcontent;
  } catch (error) {
    console.log(error);
    labelCreateStatus.textContent = "Error" + error;
    labelCreateStatus.setAttribute("role", "alert");
  }
}


async function checkAuthentication() {
  try {
    const session = await fetch('session');
    if (session.loggedIn) {
      // User is signed in
      console.log('User is signed in');
      console.log('WebID: ', session.webId);
    } else {
      // User is not signed in
      console.log('User is not signed in');
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
}
// checkAuthentication();


async function addToSeen(record) {
  const SELECTED_POD = document.getElementById("select-pod").value;

  // For simplicity and brevity, this tutorial hardcodes the  SolidDataset URL.
  // In practice, you should add in your profile a link to this resource
  // such that applications can follow to find your list.
  const readingListUrl = `${SELECTED_POD}getting-started/readingList/mySeenList`;

  // Fetch or create a new reading list.
  let myReadingList;

  try {
    // Attempt to retrieve the reading list in case it already exists.
    myReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
    if (myReadingList !== null) {
      console.log("Dataset loaded.");
    }
  } catch (error) {
    if (typeof error.statusCode === "number" && error.statusCode === 404) {
      // if not found, create a new SolidDataset (i.e., the reading list)
      myReadingList = createSolidDataset();
      // myReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
      // if (myReadingList !== null) {
      //   console.log("Dataset loaded.");
      // }
      console.log("Dataset created.");
    } else {
      console.log("No Dataset loaded.");
      console.error(error.message);
    }
  }

  // Add record seen to the Dataset when 
  let recordInput;
  console.log(getThingAll(myReadingList));
  if (getThingAll(myReadingList) === 0) {
      console.log("Thing doesn't Exist.");
      recordInput = createThing({ name: "SeenList" });  // systemNumber: record["systemNumber"]
      recordInput = addUrl(recordInput, RDF.type, AS.Article);
      recordInput = addStringNoLocale(recordInput, SCHEMA_INRUPT.name, JSON.stringify(record, null));
      myReadingList = setThing(myReadingList, recordInput);
    } else {
      console.log("Thing Exists.");
      let oldRecord = getThingAll(myReadingList);
      console.log(oldRecord);
      console.log(JSON.stringify(oldRecord));
      recordInput = createThing({ name: "SeenListUpdate" });  // systemNumber: record["systemNumber"]
      recordInput = addUrl(recordInput, RDF.type, AS.Article);
      recordInput = addStringNoLocale(recordInput, SCHEMA_INRUPT.name, JSON.stringify(record).replaceAll("\\", "") + JSON.stringify(oldRecord).replaceAll("\\", ""));
      myReadingList = setThing(myReadingList, recordInput);
    }
  

  try {
    // Save the SolidDataset
    let savedReadingList = await saveSolidDatasetAt(
      readingListUrl,
      myReadingList,
      { fetch: fetch }
    );

    // Refetch the Reading List
    savedReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });

    let items = getThingAll(savedReadingList);

    let listcontent = "";
    for (let i = 0; i < items.length; i++) {
      let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
      if (item !== null) {
        listcontent += item + "\n";
      }
    }
    document.getElementById("labelmySeenList").textContent = listcontent;

  } catch (error) {
    console.log("addToSeen Error");
    console.log(error);
    labelCreateStatus.textContent = "Error" + error;
    labelCreateStatus.setAttribute("role", "alert");
  }
}

buttonLogin.onclick = function () {
  loginToSelectedIdP();
};

buttonRead.onclick = function () {
  getMyPods();
};

buttonCreate.onclick = function () {
  createList();
};
  
// Changes Login Button to (dis)abled by value IF select-idp == "--Please select an Identity Provider (IdP)--"

// selectorIdP.addEventListener("change", idpSelectionHandler);
// function idpSelectionHandler() {
//   if (selectorIdP.value === "" && selectorIdP.value == "--Please select an Identity Provider (IdP)--") {
//     buttonLogin.setAttribute("disabled", "disabled");
//   } else {
//     buttonLogin.removeAttribute("disabled");
//   }
// }

// Changes Get Pod URL(s) Button to (dis)abled by value
  selectorPod.addEventListener("change", podSelectionHandler);
  function podSelectionHandler() {
    if (selectorPod.value === "") {
      buttonCreate.setAttribute("disabled", "disabled");
    } else {
      buttonCreate.removeAttribute("disabled");
    }
  }


// app.js code insert

// Define HTML elements
const buttonNext = document.getElementById("btnNext");
const buttonLike = document.getElementById("btnLike");
const buttonDislike = document.getElementById("btnDislike");
const labelmySeenList = document.getElementById("labelmySeenList");
const buttonDeleteSeenList = document.getElementById("btnDeleteSeenList");

const img = document.getElementById('img');
const imgTitle = document.getElementById('imgTitle');
const imgParagraph = document.getElementById('imgParagraph');
var imageList = [];

async function getImageList() {
  const response = await fetch("https://api.vam.ac.uk/v2/objects/search?page_size=3&images_exist=1"); // https://api.vam.ac.uk/v2/objects/search?images_exist=1 
  const jsonData = await response.json();
  console.log(jsonData);
  return jsonData;
}

// Somehow main function
getImageList()
  // .then(() => {
  //   checkAuthentication() == true
  // })
  .then((imageList) => {
    // Set initial image 
    img.src = "https://framemark.vam.ac.uk/collections/" + imageList.records[0]["_primaryImageId"] + "/full/!500,500/0/default.jpg";
    imgTitle.innerHTML = imageList.records[0]["objectType"];
    imgParagraph.innerHTML = imageList.records[0]["_primaryTitle"];    
    // addToSeen(imageList.records[0]);

    // Set initial image index
    let currentIndex = 0;

    // Function to iterate through images
    function getNextImage() {
      // Increment the index and handle wrap-around
      currentIndex = (currentIndex + 1) % imageList.records.length;
      // Set the src attribute to the next image in the list
      img.src = "https://framemark.vam.ac.uk/collections/" + imageList.records[currentIndex]["_primaryImageId"] + "/full/!500,500/0/default.jpg";
      // Set the title attribute to the next image in the list
      imgTitle.innerHTML = imageList.records[currentIndex]["objectType"];
      // Set the description attribute to the next image in the list
      imgParagraph.innerHTML = imageList.records[currentIndex]["_primaryTitle"];
    }

    function getRandomImg() {
      // Remember img what have been shown
      let shownImg = [];
      // Get random number
      let randomIndex = Math.floor(Math.random() * imageList.records.length);
      // Get img that have not been used in shownImg
      while (shownImg.includes(randomIndex)) {
        randomIndex = Math.floor(Math.random() * imageList.records.length);
      }
      // Add img to shownImg
      shownImg.push(randomIndex);

      // Set the src attribute to the next image in the list
      img.src = "https://framemark.vam.ac.uk/collections/" + imageList.records[randomIndex]["_primaryImageId"] + "/full/!500,500/0/default.jpg";
      // Set the title attribute to the next image in the list
      imgTitle.innerHTML = imageList.records[randomIndex]["objectType"];
      // Set the description attribute to the next image in the list
      imgParagraph.innerHTML = imageList.records[randomIndex]["_primaryTitle"];

      addToSeen(imageList.records[randomIndex]);
    }

    // Function to store liked images
    function storeLike() {
      
    }

    function deleteSeenList() {
      try {
        const SELECTED_POD = document.getElementById("select-pod").value;
        const url = `${SELECTED_POD}getting-started/readingList/mySeenList`;
        deleteSolidDataset(
          url, { fetch: fetch } // fetch function from authenticated session
        );
      } catch (error) {
        console.log("deleteSeenList Error: " + error);
      }
    }


    // Define actions on Front End
    buttonNext.onclick = function() {
      getRandomImg();
    };
    buttonLike.onclick = function() {
      storeLike();
    };
    buttonDislike.onclick = function() {
      storeDislike();
    };

    buttonDeleteSeenList.onclick = function() {
      deleteSeenList();
    }

  })
  .catch((error) => {
    console.log(error);
  });



