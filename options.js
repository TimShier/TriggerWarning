// get the categories
// to do this, we look in /triggers/overall.json
// in this, there are a number o
// each has a index.json file in it which
// has an attribute "category" with the
// category name.


var data = {};




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

                                            if(curData.status == "H"){
                                                $("#triggerCatHolder").append("<h3>"+curData.name+"</h3>" +
                                                    "<select id='category_status_"+curData.name+"' ><option value='0'>Don't block</option><option value='S'>Soft Block</option><option value='H' selected='selected'>Hard Block</option></select>" +
                                                    "<input class='jscolor'  id='category_color_"+curData.name+"' value='"+curData.color+"'><br/>");
                                            }
                                            else if(curData.status == "S"){
                                                $("#triggerCatHolder").append("<h3>"+curData.name+"</h3>" +
                                                    "<select id='category_status_"+curData.name+"' ><option value='0'>Don't block</option><option value='S' selected='selected'>Soft Block</option><option value='H'>Hard Block</option></select>" +
                                                    "<input class='jscolor'  id='category_color_"+curData.name+"' value='"+curData.color+"'><br/>");
                                            }
                                            else
                                            {
                                                $("#triggerCatHolder").append("<h3>"+curData.name+"</h3>" +
                                                    "<select id='category_status_"+curData.name+"' ><option value='0' selected='selected'>Don't block</option><option value='S'>Soft Block</option><option value='H'>Hard Block</option></select>" +
                                                    "<input class='jscolor'  id='category_color_"+curData.name+"' value='"+curData.color+"'><br/>");
                                            }

                                            // now that the core stuff is in place, let's give the user the ability to see the bad words...
                                            $("#triggerCatHolder").append("<span id='bad1_"+curData.name+"'>View trigger words</span><span id='bad2_"+curData.name+"' style='display:none;'>Are you sure? They may be triggering.</span><span id='bad_hide_"+curData.name+"' style='display:none;'>Hide words</span><div id='badWords_"+curData.name+"' style='display:none;'><ul id='badWords_ul_"+curData.name+"'></div><br/><a target='_blank' href='https://twitter.com/intent/tweet?text=Hi%20%40cdc_engage%2C%20I%27m%20looking%20at%20category%20%23"+curData.name+"\%2C%20I%27d%20suggest%20adding%20%3Cyour%20word%2Fs%3A)%3E'>Suggest word</a>")

                                            for(var badI in curData.badWords){
                                                $("#badWords_ul_"+curData.name).append("<li>"+curData.badWords[badI]+"</li>")
                                            }

                                            console.log("adding listeners for " + curData.name);

                                            // add listener and handle in the functions. Use closure to lock in curData.name
                                            // this feels like bad code... is there a better way?
                                            // there must be...
                                            (function(name){
                                                    document.getElementById('bad1_' + name).addEventListener("click", function(){
                                                        clickBadStep1(name)
                                                    }, false);
                                            }(curData.name));

                                            (function (name){
                                                    document.getElementById('bad2_' + name).addEventListener("click", function(){
                                                        clickBadStep2(name)
                                                    }, false);
                                            }(curData.name));

                                            (function (name){
                                                    document.getElementById('bad_hide_' + name).addEventListener("click", function(){
                                                        clickHideBad(name)
                                                    }, false);
                                            }(curData.name));




                                            if(curData.isCustom == true){
                                                // there is custom data here...
                                                isCustom = true;

                                                // so, add an edit option to the div.
                                                $("#triggerCatHolder").append("<span id='edit_option_" + curData.name+"'>edit custom category ("+curData.name+")</span>")

                                                // add click event trigger.
                                                $("#edit_option_" + curData.name).on("click", function(){
                                                    //alert("edit custom");
                                                    enableEdit(curData.name);
                                                })

                                                // let's also add a hidden div that contains the edit deets...
                                                $("#triggerCatHolder").append("<div id='edit_"+curData.name+"' style='display:none;'>" +
                                                    "<input type='text' id='edit_name_"+curData.name+"' value='"+curData.name+"'/>" + "<br/>" +
                                                    "<label>Safe Sentence:</label><input type='text' style='height:51px;' id='edit_safe_"+curData.name+"' value='"+curData.safeWords+"'>"+
                                                    "<label>Triggering Words, comma separated, no spaces:</label><input type='text' style='height:51px;' id='edit_bad_"+curData.name+"' value='"+curData.badWords+"'>"+
                                                    "<p id='edit_save_"+curData.name+"' class='submitBnt'>Save changes</p>"+
                                                    "</div>");

                                                // set up event to watch for clicks on save.
                                                $("#edit_save_"+curData.name).on("click", function(){
                                                    saveCustomCategory(curData.name);
                                                    disableEdit(curData.name)
                                                })


                                            }

                                        }

                                        if(!isCustom){
                                            // add the ability to add custom vars
                                            $("#triggerCatHolder").append("<br/><p id='addCustom' class='submitBnt'>Add Custom Category</p>");
                                            $("#triggerCatHolder").append("<div id='customCategory' style='display:none;'>" + "<h3>Custom Category</h3>" +
                                                "<input type='text' id='customName' placeholder='One word name'/>" + "<br/>" +
                                                "<select id='custom_status'><option value='0'>Don't block</option><option value='S' selected='selected'>Soft Block</option><option value='H'>Hard Block</option></select><br/>" +
                                                "<input class='jscolor' style='height:51px;' id='custom_color' value='FF0000'><br/>" +
                                                "<label>Safe Sentence:</label><input type='text' style='height:51px;' id='customSafe'>"+
                                                "<label>Triggering Words, comma seperated, no spaces:</label><input type='text' style='height:51px;' id='customBad'>"+
                                                "<p id='saveCustom' class='submitBnt'>Save Custom Category</p>"+
                                                "</div>");

                                            // add listeners for add Custom etc.
                                            document.getElementById('addCustom').addEventListener('click',makeCustom);
                                            document.getElementById('saveCustom').addEventListener('click',saveCustom);
                                        }

                                        // now that this is all done, let's re-trigger jscolor
                                        jscolor.installByClassName("jscolor");
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

//// add the triggers
//$("#bad1_"+curData.name).on("click", function(){
//    // hide bad 1 and show bad 2
//    $("#bad1_"+curData.name).hide();
//    $("#bad2_"+curData.name).show();
//});
//
//
//$("#bad2_"+curData.name).on("click", function(){
//    // hide bad 2 and show badwords
//    $("#bad2_"+curData.name).hide();
//    $("#badWords_"+curData.name).show();
//    $("#bad_hide_"+curData.name).show();
//    // show bad_hide
//});
//
//$("#bad_hide_"+curData.name).on("click", function(){
//    // reset the whole thing...
//    $("#bad1_"+curData.name).show();
//    $("#bad2_"+curData.name).hide();
//    $("#badWords_"+curData.name).hide();
//    $("#bad_hide_"+curData.name).hide();
//});


//
function clickBadStep1(catName){
    // hide bad 1 and show bad 2
    console.log("click bad 1");
    $("#bad1_"+catName).hide();
    $("#bad2_"+catName).show();
}
function clickBadStep2(catName){
    // hide bad 2 and show badwords
    console.log("click bad 2");
    $("#bad2_"+catName).hide();
    $("#badWords_"+catName).show();
    $("#bad_hide_"+catName).show();

}

function clickHideBad(catName){
    // reset the whole thing...
    console.log("click bad hide");
    $("#bad1_"+catName).show();
    $("#bad2_"+catName).hide();
    $("#badWords_"+catName).hide();
    $("#bad_hide_"+catName).hide();

}

function enableEdit(nameStr){
    // make the hidden div visible so that editing on safeWord and badWords is activated via form.
    $("#edit_"+nameStr).show();
}

function disableEdit(nameStr){
    // make the hidden div visible so that editing on safeWord and badWords is activated via form.
    $("#edit_"+nameStr).hide();
}

function makeCustom(){
    $("#addCustom").hide();
    $("#customCategory").show();

}

// this is basically the "save custom".
// TODO: migrate both into same method by changing naming in div appends for custom edit.

function saveCustomCategory(catName){
    // create a JSON object and populate it as if it were a badCategory.
    var jsonObject = {};

    // now, let's get hold of the variables we need.

    // using specific to custom edit.
    var name = $("#edit_name"+catName).val();

    // using generic
    var status = $("#category_status_"+catName).val();
    var colour = $("#category_color_"+catName).val();

    // using specific to custom edit.
    var safeWords = $("#edit_safe_"+catName).val();
    var badWords = $("#edit_bad_"+catName).val(); // need to turn into ["word1", "word2", "word3"] before can save.

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

    chrome.storage.sync.set({
        "triggerCustomCategory": jsonObject
    }, function() {
        console.log("triggerCustomCategory saved: " + jsonObject);
    });
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

    chrome.storage.sync.set({
        "triggerCustomCategory": jsonObject
    }, function() {
        console.log("triggerCustomCategory saved: " + jsonObject);
        alert("Custom settings saved");
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
        alert("Settings saved.")
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
