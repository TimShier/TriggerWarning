// get the categories
// to do this, we look in /triggers/overall.json
// in this, there are a number o
// each has a index.json file in it which
// has an attribute "category" with the
// category name.


var data = {};



// TODO has not been updated for custom settings...

function mergeDataWithCustomCategory(tmpDataJson, tmpCustomCategory){
    // merge a new category with the current data...
    // no tests for duplicates or anything... rough and ready.
    // let's do it
    var currentKey = Object.keys(tmpCustomCategory)[0]
    tmpDataJson.badCategories[currentKey] = tmpCustomCategory[currentKey]
    return tmpDataJson
}

function mergeDataWithSavedSettings(tmpDataJson, tmpSettingsString){
    // takes a data object and the settings
    // for each item in the settings update the tmpData
    // with that config and return the tmpData.
    // settings format a semi-colon seperated string of form
    // categoryName[* len]--status[0,S,H]--color[hex without #];categoryName2[* len]--status2[0,S,H]--color2[hex without #];

    // 1 split it into it's parts by semi-comma
    // 2 for each in array, look up the appropriate place in tmpData and make necessary updates
    // 3 return tmpData.

    console.log("tmpJson is");
    console.log(tmpDataJson);
    console.log("tmpJson was");

    console.log("tmpSettingString is");
    console.log(tmpSettingsString);
    console.log("tmpSettingString was");

    var tmpSettingsArray = tmpSettingsString.split(";");
    console.log(tmpSettingsArray);
    for(var yer = 0 ; yer < tmpSettingsArray.length;yer++){
        var curSetting = tmpSettingsArray[yer];

        if(curSetting.length>1){

            // TODO
            // TODO - there's blank objects in the mix. There shouldn't be. This is a quick fix for this
            // TODO

            // now that we have it, let's break it up by "--"
            var curSettingArray = curSetting.split("--");
            // 0 = categoryName
            // 1 = status
            // 2 = color
            console.log("curSettings is");
            console.log(curSettingArray);
            console.log("curSettings was");
            tmpDataJson.badCategories[curSettingArray[0]].status = curSettingArray[1];
            tmpDataJson.badCategories[curSettingArray[0]].color = curSettingArray[2];
        }


    }
    return tmpDataJson;

}

function configPage(){
    chrome.runtime.getPackageDirectoryEntry(function(root) {
        root.getDirectory("triggers", {create: false}, function(localesdir) {
            var reader = localesdir.createReader();
            // Assumes that there are fewer than 100 locales; otherwise see DirectoryReader docs
            reader.readEntries(function(results) {
                // for each item in this folder.
                // let's assume it's a directory
                // and look for an index.json inside it.
                var value = results[0];

                if(value.name == "data.json"){
                    console.log("found data.json" + value.name);
                    console.log("Getting data.json");
                    localesdir.getFile(value.fullPath, undefined, function (fileEntry) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader()
                            reader.addEventListener("load", function (event) {
                                // data now in reader.result
                                jsonResult = JSON.parse(reader.result);
                                console.log("JSON result start, badWords only");
                                console.log(jsonResult);
                                /********/
                                /********/
                                /********/
                                // TODO - in here use the messaging system
                                // to poll customScript and let it know that there are badwords to add
                                /********/
                                /********/
                                /********/
                                // TODO - check if the runtime is available in customScript... another way?
                                // do the callback here
                                data = jsonResult;

                                chrome.storage.sync.get(["triggerSettings", "triggerCustomCategory"],
                                    function(items) {
                                        // process the items into an array.
                                        console.log("triggerSettings being collected");
                                        // but first, we need to make sure it exists. It won't on the first load.
                                        if(items.hasOwnProperty("triggerSettings")){
                                            console.log("triggerSettings is found");
                                            // awesome, we have a save for this profile.
                                            // next, we need to split the string by commas
                                            // and iterate over each. For each change the checked status
                                            // for that id="category_<key>"
                                            console.log(items.triggerSettings);
                                            data = mergeDataWithSavedSettings(data, items.triggerSettings);
                                            console.log("done with merge");
                                            // now that we have the data. Let's create the page
                                        }
                                        else {
                                            console.log("triggerCategory isn't set");
                                        }

                                        if(items.hasOwnProperty("triggerCustomCategory")){
                                            console.log("triggerCustomCategory is found");
                                            // look at the triggerCustomCategory. This is the same
                                            // as any single category in the JSON but is saved locally
                                            // instead of referencing the core JSON.

                                            console.log(items.triggerCustomCategory);
                                            data = mergeDataWithCustomCategory(data, items.triggerCustomCategory);
                                            console.log("done with merge");
                                            // now that we have the data. Let's create the page
                                        }
                                        else {
                                            console.log("triggerCategory isn't set");
                                        }

                                        var isCustom = false;
                                        for(var xer in data.badCategories){
                                            // for each badCategory...
                                            var curData = data.badCategories[xer];
                                            // this is a bad way to do it but we can improve this later...
                                            if(curData.isCustom == true){
                                                isCustom = true;
                                            }
                                            if(curData.status == "H"){
                                                $("#triggerCatHolder").append("<label>"+curData.name+"</label>" +
                                                    "<select id='category_status_"+curData.name+"'><option value='0'>Don't block</option><option value='S'>Soft Block</option><option value='H' selected='selected'>Hard Block</option></select>" +
                                                    "<label>Colour:</label><input class='jscolor'  id='category_color_"+curData.name+"' value='"+curData.color+"'><br/>" +
                                                    "Color:"+curData.color+" Status: "+ curData.status +"<br/>");

                                            }
                                            else if(curData.status == "S"){
                                                $("#triggerCatHolder").append("<label>"+curData.name+"</label>" +
                                                    "<select id='category_status_"+curData.name+"'><option value='0'>Don't block</option><option value='S' selected='selected'>Soft Block</option><option value='H'>Hard Block</option></select>" +
                                                    "<label>Colour:</label><input class='jscolor'  id='category_color_"+curData.name+"' value='"+curData.color+"'><br/>" +
                                                    "Color:"+curData.color+" Status: "+ curData.status +"<br/>");

                                            }
                                            else
                                            {
                                                $("#triggerCatHolder").append("<label>"+curData.name+"</label>" +
                                                    "<select id='category_status_"+curData.name+"'><option value='0' selected='selected'>Don't block</option><option value='S'>Soft Block</option><option value='H'>Hard Block</option></select>" +
                                                    "<label>Colour:</label><input class='jscolor'  id='category_color_"+curData.name+"' value='"+curData.color+"'><br/>" +
                                                    "Color:"+curData.color+" Status: "+ curData.status +"<br/>");
                                            }

                                        }

                                        if(!isCustom){
                                            // add the ability to add custom vars
                                            $("#triggerCatHolder").append("<p id='addCustom'>Add Custom Category</p>");
                                            $("#triggerCatHolder").append("<div id='customCategory' style='display:none;'>" +
                                                "<input type='text' id='customName'/>" +
                                                "<select id='custom_status'><option value='0'>Don't block</option><option value='S' selected='selected'>Soft Block</option><option value='H'>Hard Block</option></select>" +
                                                "<label>Colour:</label><input class='jscolor' id='custom_color' value='FF0000'><br/>" +
                                                "<label>Safe Sentence:</label><input type='text' id='customSafe'>"+
                                                "<label>Triggering Words, comma seperated, no spaces:</label><input type='text' id='customBad'>"+
                                                "<p id='saveCustom'>Save Custom Category</p>"+
                                                "</div>");

                                            // add listeners for add Custom etc.
                                            document.getElementById('addCustom').addEventListener('click',makeCustom);
                                            document.getElementById('saveCustom').addEventListener('click',saveCustom);
                                        }
                                    });
                                //callback(jsonResult);
                                console.log("JSON result end");
                                //console.log(badWords);
                            });
                            reader.readAsText(file);
                        });
                    }, function (e) {
                        console.log(e);
                    });


                }
                console.log(value.fullPath);

            });
        });
    });


}

function makeCustom(){
    alert("makingCustom");
    $("#addCustom").hide();
    $("#customCategory").show();

}

function saveCustom(){
    // create a JSON object and populate it as if it were a badCategory.
    var jsonObject = {};

    // now, let's get hold of the variables we need.
    var name = $("#customName").val();
    var status = $("#custom_status").val();
    var colour = $("#custom_color").val();
    var safeWords = $("#customSafe").val();
    var badWords = $("#customBad").val(); // need to turn into ["word1", "word2", "word3"] before can save.

    var newBadWords = badWords.split(",");


    // add it all to the object...
    jsonObject[name] = {"name":name, "safeWords": safeWords, "badWords": newBadWords,"status": status, "color":colour, "isCustom":true};
//    "Cat": {
//        "name": "Cat",
//            "safeWord":"Domesticated four legged animal. Dog's chase them.",
//            "badWords":["cat", "meow", "feline"],
//            "status": "0",
//            "color": "000077"
//    }


    alert("saving custom!");
    chrome.storage.sync.set({
        "triggerCustomCategory": jsonObject
    }, function() {
        console.log("triggerCustomCategory saved: " + jsonObject);
    });
}


//function setItAllUp(){
//
//  chrome.runtime.getPackageDirectoryEntry(function(root) {
//    root.getDirectory("triggers", {create: false}, function(localesdir) {
//      var reader = localesdir.createReader();
//      // Assumes that there are fewer than 100 locales; otherwise see DirectoryReader docs
//      reader.readEntries(function(results) {
//        // for each item in this folder.
//        // let's assume it's a directory
//        // and look for an index.json inside it.
//        for (let value of results) {
//          if(value.isDirectory){
//            console.log("directory of name" + value.name);
//            console.log("Getting index.json in folder");
//            localesdir.getFile(value.fullPath+"/index.json", undefined, function (fileEntry) {
//              fileEntry.file(function (file) {
//                      var reader = new FileReader()
//                      reader.addEventListener("load", function (event) {
//                          // data now in reader.result
//                          jsonResult = JSON.parse(reader.result);
//                          // we have a JSON Object. Let's use it to build the page.
//                          $("#triggerCatHolder").append("<label>"+jsonResult.category+"</label> <input type='checkbox' class='triggerBoxes' id='category_"+jsonResult.category+"' name='triggerCategories' value='"+jsonResult.category+"'><br/>");
//                          console.log(jsonResult);
//
//
//                          // jsonCategories["'"+value.name+"'"] = jsonResult;
//                          // console.log(jsonResult.category);
//                      });
//                      reader.readAsText(file);
//                  });
//            }, function (e) {
//                console.log(e);
//            });
//
//
//          }
//          console.log(value.fullPath);
//
//          // expected output: 1
//        }
//
//      });
//    });
//  });
//
//
//}

// Saves options to chrome.storage
function saveSettings() {
  console.log("Saving options");
    // let's look at the data object
    // then iterate over it and for each categoryName
    // attempt to find a corresponding colour and status setting.
    // if it exists, get it into the correct format
    // and save it to local store.

    var returnString = "";
    var isFirst = true;

    for(var it in data.badCategories){
        // for each category. Find the appropriate setting.
        var name = data.badCategories[it].name;
        var color = $("#category_color_"+name).val();
        var status = $("#category_status_"+name).val();

        // save format is:
        //categoryName[* len]--status[0,S,H]--color[hex without #];
        var tmpString = name + "--" + status + "--" + color + ";"

        if(isFirst){
            returnString = tmpString;
            isFirst = false;
        }
        else
        {
            returnString = returnString +";"+ tmpString;
        }




    }

    // save to store.
    chrome.storage.sync.set({
        "triggerSettings": returnString
    }, function() {
        console.log("triggerSettings saved: " + returnString);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreSettings() {
  // Use default value color = 'red' and likesColor = true.
//  chrome.storage.sync.get(["triggerCategories"],
//  function(items) {
//    // process the items into an array.
//    console.log("triggerCategories are [DOING NOTHING] :");
//    // but first, we need to make sure it exists. It won't on the first load.
//    if(items.hasOwnProperty("triggerCategories")){
//      console.log("triggerCategory is found");
//      // awesome, we have a save for this profile.
//      // next, we need to split the string by commas
//      // and iterate over each. For each change the checked status
//      // for that id="category_<key>"
//      console.log(items.triggerCategories);
//      var splitItems = items.triggerCategories.split(",");
//      console.log(splitItems);
//      console.log(splitItems.length);
//      for(var i = 0; i < splitItems.length; i++){
//        var tmpVar = splitItems[i];
//        console.log("TmpVar: " + tmpVar);
//        console.log("Asking for " + "#category_"+tmpVar);
//        console.log($("#category_"+tmpVar).val());
//        $("#category_"+tmpVar).attr("checked", true);
//
//      }
//      // now that we've loaded it...
//      // make #triggerCatHolder and #save visible while hiding #load
//    }
//    else {
//      console.log("triggerCategory isn't set");
//    }
//
//
//
////    document.getElementById('color').value = items.favoriteColor;
//  //  document.getElementById('like').checked = items.likesColor;
//  });

  $("#triggerCatHolder").show();
  $("#save").show();
  $("#load").hide();

  // so, now that we have the local data (if there is any)
  // we can get the categories. We then iterate over them.
  // if the id of the category is in triggerCategories
  // then we set it's status to true, otherwise false.

  // O man, why can't I just iterate over this?
  // console.log("Category");
  // console.log(categories);
  // console.log("Category done");
  // for (var key in categories) {
  //   console.log("Looking at category");
  //   console.log(categories[key]);
  // }





}

// takes an url and adds that script to the head/body
function dynamicallyLoadScript(url) {
    var script = document.createElement("script"); // Make a script DOM node
    script.src = url; // Set it's src to the provided URL

    document.body.appendChild(script); // Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}
document.addEventListener('DOMContentLoaded', configPage);
document.getElementById('save').addEventListener('click',saveSettings);
document.getElementById('load').addEventListener('click',restoreSettings);
