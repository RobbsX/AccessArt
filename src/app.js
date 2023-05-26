
const axios = require('axios');
const Papa = require('papaparse');

// Define HTML elements
let buttonNext = document.getElementById("btnNext");

function loadImages() {
    let img_list = [
    "https://framemark.vam.ac.uk/collections/2016JF9061/full/!100,100/0/default.jpg", 
    "https://framemark.vam.ac.uk/collections/2016JF9062/full/!100,100/0/default.jpg"];
    return img_list;
}

async function getNextImage() {
    let img = document.getElementById('img');
    const imgUrl = 'https://framemark.vam.ac.uk/collections/2016JF9062/full/!100,100/0/default.jpg';

    await new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
        img.src = imgUrl;
    });
}



// Define actions on Front End
document.onload = function() {
    img_list = loadImages();
}

buttonNext.onclick = function() {
    getNextImage();
  };