var app = new kendo.mobile.Application(document.body);

document.addEventListener("deviceready", onDeviceReady, false);

// Global variables

function onDeviceReady() {
	G_mainNodeId = 26460;
    G_productId = 0;
    G_pgroupId = 0;
    G_underNodeId = 0;
    G_nextUnderNodeId = 0;
    G_showedPicNr = 1;
    G_soundOn = true;
    G_mylist = [];
    G_lastClicked = 0;
    
    _H = screen.availHeight;
    _W = screen.availWidth;
    _pD = screen.pixelDepth;
}

// Functions

function precise_round (num,decimals) {
    return Math.round(num*Math.pow(10,decimals))/Math.pow(10,decimals);
}

function tapControl (Id) {
    G_lastClicked = Id;            
}

function tapMoveControl () {
    G_lastClicked = 0;            
}

/*function addAnimate (Id) {
    document.getElementById("addText" + Id).width="20px";
    
    setTimeout( function () {
        console.log("apa");
        document.getElementById("addText" + Id).text="Lägg till i Min Lista";
    }, 1000);
}*/

// Loading the youtubelist and list all the films

function loadYoutube () {
    console.log("------ENTER FILMS VIEW------");
    var playListURL = 'http://gdata.youtube.com/feeds/api/playlists/PL05CAF9D5AFC14AF8?v=2&alt=json&callback=?';
    var videoURL= 'http://www.youtube.com/watch?v=';
    $.getJSON(playListURL, function(data) {
        var listData="";
        $.each(data.feed.entry, function(i, item) {
            var feedTitle = item.title.$t;
            var feedURL = item.link[1].href;
            var fragments = feedURL.split("/");
            var videoID = fragments[fragments.length - 2];
            var url = videoURL + videoID;
            
            listData += '<li style="margin-top: -10px;"><a href="#showFilm?id=' + videoID + '" data-role="button"><h2 style="font-size:14px; padding-top: 5px;">' + feedTitle+ '</h2></a></li>';
        });
        $(listData).appendTo("#filmContent");
    });
}

// Open the selected video and show it

function openVideo (e) {
    console.log(e.view.params.id);
    document.getElementById("showFilmContent").innerHTML='<iframe width="' + _W + '" height="' + _H/2 + '" src="http://www.youtube.com/embed/' + e.view.params.id + '"&autoplay=true /></iframe>';
}

// Getting the selected productgroup and setting the Header to it

function getProductHeader (Id, page) {
    var text = "";
    for(var i = 0; i < jsonProducts.length; i++) {
        if (Id == jsonProducts[i].productGroupId) {
            text = jsonProducts[i].productGroupName;
            if (page == "Product") {
                document.getElementById("productHeaderProduct").innerHTML=text;        
            } else if (page == "Pics") {
                document.getElementById("productHeaderPics").innerHTML=text;       
            } else if (page == "Info") {
                document.getElementById("productHeaderInfo").innerHTML=text; 
            }
            
            break;
        }
    }
}

// Show the selected product

function showProduct (Id) {
	if (G_lastClicked == Id) {
		console.log("------SHOWING PRODUCT------");
		var Image;
		var Ean;
		var PartNumber;
		var WholeSalerNumber;
		var descriptionShort;
		for (var i = 0; i < jsonProducts.length; i++) {
			if (Id == jsonProducts[i].productId) {
				Image = jsonProducts[i].nodeImage;
				Ean = jsonProducts[i].ean13Code;
				PartNumber = jsonProducts[i].partnumber;
				WholeSalerNumber = jsonProducts[i].wholesalerNumber;
				descriptionShort = jsonProducts[i].partnumberDescriptionShort;
			}
		}    
		var text = '<img src="http://mediabase.snb.schneider-electric.com/displayimage.ashx?mediano=' + Image + '&t=gif" style="display: block; margin-left: auto; margin-right: auto;" alt=""/>';
		text += '<p>' + descriptionShort + '</p><p>E-nummer: ' + WholeSalerNumber + '<BR/>Art. nr.: ' + PartNumber + '<BR/>EAN: ' + Ean + '</p><p style="text-align:right;"><a id="add' + Id + '"><span id="addText' + Id + '">Lägg till i Min Lista</span><img src="images/add-mylist.png" alt=""/></a></p>';
		document.getElementById("product" + Id).innerHTML = text;
		document.getElementById("pList" + Id).style.backgroundImage = "url(images/btn-down.png)";
		$("#product" + Id).hide();
		$("#product" + Id).toggle("slow", function () {
			document.getElementById("pLink" + Id).setAttribute("onTouchEnd", "unshowProduct(" + Id + ")");
			document.getElementById("add" + Id).setAttribute("onTouchEnd", "saveToMylist(" + Id + ")");
		});
	}    
}

// Hide the selected product

function unshowProduct (Id) {
    if (G_lastClicked == Id) {
        console.log("------UNSHOWING PRODUCT------");
        document.getElementById("pList" + Id).style.backgroundImage="url(images/btn-right.png)";
        $("#product" + Id).toggle("slow", function () {
            document.getElementById("pLink" + Id).setAttribute("onTouchEnd", "showProduct(" + Id + ")");    
        });
    }
}

// Removing the selected product from mylist

function removeMylistItem(Id) {
    console.log("------REMOVING------");
    if (localStorage.id !== undefined) {
        G_mylist = localStorage.id.split("-");
        console.log("Array längd: " + G_mylist.length);        
    }
    localStorage.clear();
    for (var i = 0; i < G_mylist.length; i++) {
        console.log("Plats "+ i + " i Arrayen är: " + G_mylist[i]);
        if (i != Id && G_mylist[i] != "undefined" && G_mylist[i] !== undefined) {
            localStorage.id += "-" + G_mylist[i];
            console.log("LocalStorage innehåller: " + localStorage.id);
        } else {
            console.log("SKALL EJ MED!");    
        }
    }
    document.getElementById("mylistList").innerHTML='';
    showMylist();
}

// Saving the product to mylist

function saveToMylist (Id) {
    console.log("------SAVING PRODUCT TO MYLIST------");
    //addAnimate(Id);
    localStorage.id += "-"+Id;    
}

// Show all products in mylist

function showMylist (e) {
    console.log("------ENTER MYLIST VIEW------");
    var text = "";

    console.log("------SHOWING------");
    if (localStorage.id !== undefined) {
        G_mylist = localStorage.id.split("-");    
        for (var i = 0; i < G_mylist.length; i++) {
            console.log("Plats "+ i + " i Arrayen är: " + G_mylist[i]);
            for (var j = 0; j < jsonProducts.length; j++) {
                if (G_mylist[i] == jsonProducts[j].productId) {
                    text += '<li id="mylistItem' + i + '" style="margin-top: ' + (-10) + 'px;"><a href="#products?productGroupId=' + jsonProducts[j].productGroupId + '" data-role="button" data-transition="slide"><h2>' + jsonProducts[j].partnumberDescription + '</h2></a><a data-role="button" onTouchEnd="removeMylistItem(' + i + ')" class="delButton"><p>Ta Bort</p></a></li>';    
                    break;
                }
            }
        }
        document.getElementById("mylistList").innerHTML=text; 
    } else {
        document.getElementById("mylistList").innerHTML="";
    }
}

// Get all the main nodes

function showNodes () {
    console.log("------ENTER NODES VIEW------");
    var text = "";
    var tempArr = [""];
    var createAble = true;
    for(var i = 0; i < jsonProducts.length; i++){
         createAble = true;
         for(var j = 0; j < tempArr.length; j++){
             if (jsonProducts[i].nodeName == tempArr[j]){
                 createAble = false;
             }
         }
         if (jsonProducts[i].nodeParentId == G_mainNodeId && createAble == true) {
             text += '<li><a href="#underNodes?underNodeId=' + jsonProducts[i].nodeId + '" id="' + jsonProducts[i].nodeId + '" data-role="button" data-transition="slide"><h2>' + jsonProducts[i].nodeName + '</h2></a></li>';
             tempArr[tempArr.length] = jsonProducts[i].nodeName.toString();
         }
    }
    document.getElementById("nodesList").innerHTML=text;
    
}

// Get all nodes and product groups that have the picked node as parent and listing them

function showUnderNodes (e) {
    console.log("------ENTER UNDERNODES VIEW STEP 1------");
    var underNodeId;
    if (e.view.params.underNodeId !== undefined) {
        underNodeId = e.view.params.underNodeId;
        G_underNodeId = underNodeId;    
    } else {
        underNodeId = G_underNodeId;
    }
    var text = "";
    var tempArr = [""];
    var size = 22;
    var pad = 0;
    var createNodeAble = true;
    var createPgroupAble = true;
    for(var i = 0; i < jsonProducts.length; i++){
         createNodeAble = true;
         size = 22;
         pad = 0;
         for(var j = 0; j < tempArr.length; j++){
             if (jsonProducts[i].nodeName == tempArr[j]){
                 createNodeAble = false;
             }                              
         }
         if (jsonProducts[i].nodeParentId == underNodeId && createNodeAble == true) {
             if (jsonProducts[i].nodeName.length > 20 && jsonProducts[i].nodeName.length <= 25) {
                 size = 20;
                 pad = 22 - size;
             }else if (jsonProducts[i].nodeName.length > 25 && jsonProducts[i].nodeName.length <= 30) {
                 size = 17;
                 pad = 22 - size;
             }else if (jsonProducts[i].nodeName.length > 30 && jsonProducts[i].nodeName.length <= 35) {
                 size = 14;
                 pad = 22 - size;
             }else if (jsonProducts[i].nodeName.length > 35 && jsonProducts[i].nodeName.length <= 40) {
                 size = 11;
                 pad = 22 - size;
             }
             text += '<li style="margin-top: ' + (-15 + pad) + 'px;"><a href="#productGroups?nextUnderNodeId=' + jsonProducts[i].nodeId +'" id="' + jsonProducts[i].nodeId + '" data-role="button" data-transition="slide"><h2 style="font-size:' + size + 'px; padding-top:' + pad + 'px">' + jsonProducts[i].nodeName + '</h2></a></li>';   
             tempArr[tempArr.length] = jsonProducts[i].nodeName.toString();
         }      
    }
                 
    for(i = 0; i < jsonProducts.length; i++){
         createPgroupAble = true;
         size = 22;
         pad = 0;        
         for(j = 0; j < tempArr.length; j++){
             if (jsonProducts[i].productGroupName == tempArr[j]){
                 createPgroupAble = false;
             }
         }
         if (jsonProducts[i].nodeId == underNodeId && createPgroupAble == true) {
             if (jsonProducts[i].productGroupName.length > 20 && jsonProducts[i].productGroupName.length <= 25) {
                 size = 20;
                 pad = 22 - size;
             }else if (jsonProducts[i].productGroupName.length > 25 && jsonProducts[i].productGroupName.length <= 30) {
                 size = 17;
                 pad = 22 - size;
             }else if (jsonProducts[i].productGroupName.length > 30 && jsonProducts[i].productGroupName.length <= 35) {
                 size = 14;
                 pad = 22 - size;
             }else if (jsonProducts[i].productGroupName.length > 35 && jsonProducts[i].productGroupName.length <= 40) {
                 size = 11;
                 pad = 22 - size;
             }    
             text += '<li style="margin-top: ' + (-15 + pad) + 'px;"><a href="#products?productGroupId=' + jsonProducts[i].productGroupId + '" id="' + jsonProducts[i].productGroupId + '" data-role="button"><h2 style="font-size:' + size + 'px; padding-top:' + pad + 'px;">' + jsonProducts[i].productGroupName + '</h2></a></li>';   
             tempArr[tempArr.length] = jsonProducts[i].productGroupName.toString();
         }
    }
                 
    document.getElementById("underNodesList").innerHTML=text;
}

// Get all product groups that have the picked node as parent and listing them

function showProductGroups (e) {
    console.log("------ENTER UNDERNODES VIEW STEP 2------");
    var nextUnderNodeId
    if (e.view.params.nextUnderNodeId != undefined) {
        nextUnderNodeId = e.view.params.nextUnderNodeId;
        G_nextUnderNodeId = nextUnderNodeId;
    } else {
        nextUnderNodeId = G_nextUnderNodeId;
    }
    var text = "";
    var tempArr = [""];
    var size = 22;
    var pad = 0;
    var createAble = true;
    for(var i = 0; i < jsonProducts.length; i++) {
         createAble = true;
         size = 22;
         pad = 0;
         for(var j = 0; j < tempArr.length; j++) {
             if (jsonProducts[i].productGroupName == tempArr[j]) {
                 createAble = false;
             }
         }
         if (jsonProducts[i].nodeId == nextUnderNodeId && createAble == true) {
             if (jsonProducts[i].productGroupName.length > 20 && jsonProducts[i].productGroupName.length <= 25) {
                 size = 20;
                 pad = 22 - size;
             }else if (jsonProducts[i].productGroupName.length > 25 && jsonProducts[i].productGroupName.length <= 30) {
                 size = 17;
                 pad = 22 - size;
             }else if (jsonProducts[i].productGroupName.length > 30 && jsonProducts[i].productGroupName.length <= 35) {
                 size = 14;
                 pad = 22 - size;
             }else if (jsonProducts[i].productGroupName.length > 35 && jsonProducts[i].productGroupName.length <= 40) {
                 size = 11;
                 pad = 22 - size;
             }else if (jsonProducts[i].productGroupName.length > 40 && jsonProducts[i].productGroupName.length <= 51) {
                 size = 10;
                 pad = 22 - size;
             }
             text += '<li style="margin-top: ' + (-15 + pad) + 'px;"><a href="#products?productGroupId=' + jsonProducts[i].productGroupId + '" id="' + jsonProducts[i].productGroupId + '" data-role="button" onTouch="setPgroupId(id)" data-transition="slide"><h2 style="font-size:' + size + 'px; padding-top:' + pad + 'px">' + jsonProducts[i].productGroupName + '</h2></a></li>';   
             tempArr[tempArr.length] = jsonProducts[i].productGroupName.toString();
         }
    }
                 
    document.getElementById("productGroupsList").innerHTML=text; 
}

// Get all products that have the picked product Group and listing them

function showProducts (e) {
    console.log("------ENTER PRODUCTS VIEW------");
    var pgroupId
    if (e.view.params.productGroupId != undefined) {
        pgroupId = e.view.params.productGroupId;
        G_pgroupId = pgroupId;
    } else {
        pgroupId = G_pgroupId;
    }
    var text = "";
    var tempArr = [""];
    var size = 22;
    var pad = 0;
    var createAble = true;
    
    getProductHeader(pgroupId, "Product");
    
/*    $("#productsList").destroy;
    
    var products = filterProducts(jsonProducts);
    
	$("#productsList").kendoMobileListView({
		dataSource: kendo.data.DataSource.create({ data: products}),
		template: $("#customListViewTemplate").html(),
        click: function(e) {
            console.log(e);
            showProduct(e.dataItem.productId);
        }
	});
    */
    for(var i = 0; i < jsonProducts.length; i++){
        createAble = true;
        size = 22;
        pad = 0;
        for(var j = 0; j < tempArr.length; j++) {
             if (jsonProducts[i].partnumberDescription == tempArr[j]) {
                 createAble = false;
             }
         }
        if (jsonProducts[i].productGroupId == pgroupId && createAble == true){
            if (jsonProducts[i].partnumberDescription.length > 20 && jsonProducts[i].partnumberDescription.length <= 25) {
                size = 20;
                pad = 22 - size;
            }else if (jsonProducts[i].partnumberDescription.length > 25 && jsonProducts[i].partnumberDescription.length <= 30) {
                size = 17;
                pad = 22 - size;
            }else if (jsonProducts[i].partnumberDescription.length > 30 && jsonProducts[i].partnumberDescription.length <= 35) {
                size = 14;
                pad = 22 - size;
            }else if (jsonProducts[i].partnumberDescription.length > 35 && jsonProducts[i].partnumberDescription.length <= 40) {
                size = 11;
                pad = 22 - size;
            }
            text += '<li id="pList' + jsonProducts[i].productId + '" style="margin-top: ' + (-15 + pad) + 'px;"><a id="pLink' + jsonProducts[i].productId + '" onTouchStart="tapControl(' + jsonProducts[i].productId + ')" onTouchEnd="showProduct(' + jsonProducts[i].productId + ')"><h2 style="font-size:' + size + 'px; padding-top:' + pad + 'px">' + jsonProducts[i].partnumberDescription + '</h2></a></li><div id="product' + jsonProducts[i].productId + '"></div>';
            tempArr[tempArr.length] = jsonProducts[i].partnumberDescription.toString();
        }
    }
                 
    document.getElementById("productsList").innerHTML=text;
}

function filterProducts(productArray) {
	return productArray.filter(function(product) { 
		return product.productGroupId == G_pgroupId;  
	});
}


// Show the image of the selected productgroup

function showProductPic (e) {
    console.log("------ENTER PRODUCTPIC VIEW------");
    if (e.view.params.show !== undefined) {
        if (e.view.params.show == "prev") {
            G_showedPicNr -= 1;
        } else if (e.view.params.show == "next") {
            G_showedPicNr += 1;
        }
    }
    getProductHeader(G_pgroupId, "Pics");
    var text = '<img src="catalog/' + G_pgroupId + '_' + G_showedPicNr + '.jpg" alt=""/>';
    document.getElementById("productPicsHolder").innerHTML=text;
}

// Show the info of the selected productgroup

function showProductGroupInfo (e) {
    console.log("------ENTER PRODUCTINFO VIEW------");
    getProductHeader(G_pgroupId, "Info");
    
    for(var i = 0; i < jsonProducts.length; i++){
        if (jsonProducts[i].productGroupId == G_pgroupId && jsonProducts[i].productGroupDescriptionLong != ""){
            var text = '<h3>' + jsonProducts[i].productGroupDescriptionLong + '</h3>';    
        }    
    }    
    document.getElementById("productInfoContent").innerHTML=text;
}

// Getting the acceleration of the Y-angle and placing the bubble on the spirit-level

function spiritLevel (e) {
    console.log(_H);
    function onSuccess(acceleration) {
        if (acceleration.y < 0) {
            document.getElementById("gradeHolder").innerHTML=precise_round(((acceleration.y-acceleration.y*2)*9), 1)+"°";    
        } else {
            document.getElementById("gradeHolder").innerHTML=precise_round((acceleration.y*9), 1)+"°";
        }
        document.getElementById("bubble").style.top=(_H/2-26)-(_H/15)-(acceleration.y*17.3)+'px';
    }
        
    function onError() {
        alert('onError!');
    }
    
    console.log("------ENTER SPIRIT-LEVEL VIEW------");
    document.getElementById("spiritBg").style.height=_H+'px';
    document.getElementById("spiritBg").style.width=_W+'px';
    document.getElementById("spiritBg").style.top=-(_H/15)+'px';
    document.getElementById("spiritOlay").style.height=_H+'px';
    document.getElementById("spiritOlay").style.width=_W+'px';
    document.getElementById("spiritOlay").style.top=-(_H/15)+'px';
    document.getElementById("bubble").style.top=_H/2.25-(_H/15)+'px';
    document.getElementById("gradeHolder").style.top=_H/2.5-(_H/15)+'px';
    document.getElementById("soundButton").style.top=_H/2.65-(_H/15)+'px';
    navigator.accelerometer.watchAcceleration(onSuccess, onError, { frequency: 20 });
}

// Toggle the sound and changing button image

function toggleSound () {
    if (G_soundOn == true) {
        document.getElementById("soundButton").setAttribute("src", "images/btn-off.png");
        G_soundOn = false;
    } else {
        document.getElementById("soundButton").setAttribute("src", "images/btn-on.png");
        G_soundOn = true;
    }
    
}