// get the categories
// to do this, we look in /triggers/overall.json
// in this, there are a number o
// each has a index.json file in it which
// has an attribute "category" with the
// category name.





function setItAllUp(){

  chrome.runtime.getPackageDirectoryEntry(function(root) {
    root.getDirectory("triggers", {create: false}, function(localesdir) {
      var reader = localesdir.createReader();
      // Assumes that there are fewer than 100 locales; otherwise see DirectoryReader docs
      reader.readEntries(function(results) {
        // for each item in this folder.
        // let's assume it's a directory
        // and look for an index.json inside it.
        for (let value of results) {
          if(value.isDirectory){
            console.log("directory of name" + value.name);
            console.log("Getting index.json in folder");
            localesdir.getFile(value.fullPath+"/index.json", undefined, function (fileEntry) {
              fileEntry.file(function (file) {
                      var reader = new FileReader()
                      reader.addEventListener("load", function (event) {
                          // data now in reader.result
                          jsonResult = JSON.parse(reader.result);
                          // we have a JSON Object. Let's use it to build the page.
                          $("#triggerCatHolder").append("<label>"+jsonResult.category+"</label> <input type='checkbox' class='triggerBoxes' id='category_"+jsonResult.category+"' name='triggerCategories' value='"+jsonResult.category+"'><br/>");
                          console.log(jsonResult);


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

// Saves options to chrome.storage
function saveSettings() {
  console.log("Saving options");
  // first, let's get all the name="triggerCategories"
  // from this, we build an array
  // then save that array into triggerCategories in chrome.
  var stringArray = "";
  $(".triggerBoxes:checked").each(function(){
    if(stringArray == ""){
      stringArray = stringArray + $(this).val();
    }
    else {
      stringArray = stringArray + "," + $(this).val();
    }

  });
  console.log(stringArray);
  // var color = document.getElementById('color').value;
  // var likesColor = document.getElementById('like').checked;
  chrome.storage.sync.set({
    "triggerCategories": stringArray
  }, function() {
    console.log("triggerCategories saved: " + stringArray);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreSettings() {
  // Use default value color = 'red' and likesColor = true.
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
        console.log("TmpVar: " + tmpVar);
        console.log("Asking for " + "#category_"+tmpVar);
        console.log($("#category_"+tmpVar).val());
        $("#category_"+tmpVar).attr("checked", true);

      }
      // now that we've loaded it...
      // make #triggerCatHolder and #save visible while hiding #load
    }
    else {
      console.log("triggerCategory isn't set");
    }



//    document.getElementById('color').value = items.favoriteColor;
  //  document.getElementById('like').checked = items.likesColor;
  });

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
document.addEventListener('DOMContentLoaded', setItAllUp);
document.getElementById('save').addEventListener('click',saveSettings);
document.getElementById('load').addEventListener('click',restoreSettings);
