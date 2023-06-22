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
  getStringNoLocaleAll,
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
      return true;
    } else {
      // User is not signed in
      console.log('User is not signed in');
      return false;
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
}
// checkAuthentication();

// Read the Seen List
async function getSeenList() {
  // Return mySeenList if exists, else return empty json
  let listcontent = "";
  let items;
  let json_output = [];
  try {
    const SELECTED_POD = document.getElementById("select-pod").value;
    const readingListUrl = `${SELECTED_POD}getting-started/readingList/mySeenList`;
    const savedReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
    items = getThingAll(savedReadingList);
    for (let i = 0; i < items.length; i++) {
      let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
      if (item !== null) {
        listcontent += item + "\n";
        json_output[i] = JSON.parse(item);
      }
    }
    
    // catch error 404
  } catch (error) {
    console.log(error);
  }
  return [listcontent, json_output];
}


// Add to the Seen List
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
      console.log("Dataset created.");
    } else {
      console.log("No Dataset loaded.");
      console.error(error.message);
    }
  }

  // Add record seen to the Solid Dataset, by creating a new Thing
  let recordInput = createThing({ name: "SeenList" + getThingAll(myReadingList).length });  // systemNumber: record["systemNumber"]
  recordInput = addUrl(recordInput, RDF.type, AS.Article);
  recordInput = addStringNoLocale(recordInput, SCHEMA_INRUPT.name, JSON.stringify(record, null));
  myReadingList = setThing(myReadingList, recordInput);


  try {
    // Save the SolidDataset
    let savedReadingList = await saveSolidDatasetAt(
      readingListUrl,
      myReadingList,
      { fetch: fetch }
    );
    // Display the updated list
    let [listcontent, items] = await getSeenList();
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

async function getImage() {
  const response = await fetch("https://api.vam.ac.uk/v2/objects/search?page_size=3&images_exist=1"); // https://api.vam.ac.uk/v2/objects/search?images_exist=1 
  const jsonData = await response.json();
  console.log("V&A API:");
  console.log(jsonData.records);

  // Get mySeenList if exists
  let [listcontent, items] = await getSeenList();
  console.log("My Seen List:"); 
  console.log(items);
  
  // Reduced List
  let reducedList = [];

  // Reduce: List - mySeenList
  

  // let records = jsonData.records;
  // let mySeenList = listcontent.split("\n");
  // let filteredRecords = records.filter(function (el) {
  //   return !mySeenList.includes(el.systemNumber);
  // });
  // jsonData.records = filteredRecords;
  // console.log("filteredRecords");
  // console.log(filteredRecords);
  // console.log("jsonData");
  // console.log(jsonData.records); 

  // Choose random image
  let randomIndex = Math.floor(Math.random() * jsonData.records.length);
  img.src = "https://framemark.vam.ac.uk/collections/" + jsonData.records[randomIndex]["_primaryImageId"] + "/full/!500,500/0/default.jpg";
  imgTitle.innerHTML = jsonData.records[randomIndex]["objectType"];
  imgParagraph.innerHTML = jsonData.records[randomIndex]["_primaryTitle"];


  return jsonData;
}
getImage();






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



