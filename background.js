var badWords = [];

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

    console.log(request.functionName);
    var responseHolder = ""
    if (request.functionName == "getBadWords"){
      // run getBadWords...
      // it's currently not locking so we can't use it to return
      // I'll need to find a solution here...
      console.log("Getting bad words");
      try{
        responseHolder = getBadWords();
      }
      catch(e){
        console.log(e);
      }

    }
    sendResponse({status: "busy and stuff." + responseHolder});
});


function getBadWords(){
  console.log("Starting running badWords");
  chrome.storage.sync.get(["triggerCategories"],
  function(items) {
    // process the items into an array.
    console.log("triggerCategories are [DOING NOTHING] :");
    // but first, we need to make sure it exists. It won't on the first load.
    if(items.hasOwnProperty("triggerCategories")){
      console.log("triggerCategory is found");
      // awesome, we have a save for this profile.
      // next, we need to split the string by commas
      // and iterate over each. For each change the checked status
      // for that id="category_<key>"
      console.log(items.triggerCategories);
      var splitItems = items.triggerCategories.split(",");
      console.log(splitItems);
      console.log(splitItems.length);
      for(var i = 0; i < splitItems.length; i++){
        var tmpVar = splitItems[i];
        // for each of these, we look in that folder and pull out index.json.
        // from this we then extract the badWords.
        // put it back HERE HERE HERE.
        chrome.runtime.getPackageDirectoryEntry(function(root) {
          root.getDirectory("triggers/"+tmpVar, {create: false}, function(localesdir) {
            var reader = localesdir.createReader();
            // Assumes that there are fewer than 100 locales; otherwise see DirectoryReader docs
            reader.readEntries(function(results) {
              // for each item in this folder.
              // let's assume it's a directory
              // and look for an index.json inside it.
              for (let value of results) {
                if(value.name == "index.json"){
                  console.log("found index.json" + value.name);
                  console.log("Getting index.json");
                  localesdir.getFile(value.fullPath, undefined, function (fileEntry) {
                    fileEntry.file(function (file) {
                            var reader = new FileReader()
                            reader.addEventListener("load", function (event) {
                                // data now in reader.result
                                jsonResult = JSON.parse(reader.result);
                                console.log("JSON result start, badWords only");
                                console.log(jsonResult.badWords);
                                badWords = Array.from(new Set(badWords.concat( jsonResult.badWords)));
                                console.log("JSON result end");
                                console.log(badWords);


                                // jsonCategories["'"+value.name+"'"] = jsonResult;
                                // console.log(jsonResult.category);
                            });
                            reader.readAsText(file);
                        });
                  }, function (e) {
                      console.log(e);
                  });


                }
                console.log(value.fullPath);

                // expected output: 1
              }

            });
          });
        });
      }
      // now that we've loaded it...
      // make #triggerCatHolder and #save visible while hiding #load
    }
    else {
      console.log("triggerCategory isn't set");
    }
  });
  console.log("Boot ended");
  return "donesies";
}
