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

        loadBadWords(sendBadWords);

      responseHolder = "donsies";


    }
    sendResponse({status: "busy and stuff." + responseHolder});
});


chrome.runtime.onInstalled.addListener(function (object) {

    // open the options page...

    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }

    // on install or update, take the user to the CDC website so they can read up more (in particular the disclaimer)
    chrome.tabs.create({url: "http://citizendialoguecentre.org/about-us/values-statement/"}, function (tab) {
        console.log("New tab launched with http://citizendialoguecentre.org/about-us/values-statement/");
    });
});

function loadBadWords(callback){
    // open /triggers/data.json and send the contents to customScript.js (aka all tabs).
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
                                    callback(jsonResult);


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

            });
        });
    });

}

function sendBadWords(data){
    // used as a callback, this sends the content across to all tabs for use by customJS.
  console.log("Sending badWords to tabs" + badWords);
  chrome.tabs.query({}, function(tabs) {
      for (var ii=0; ii<tabs.length; ii++) {
          //chrome.tabs.sendMessage(tabs[i].id, message);
          chrome.tabs.sendMessage(tabs[ii].id,{"data": data, "functionName":"badWords"}, function(response) {
            console.log(response);
          });
      }
  });
}
