function openSearchUrl(url, searchTerm, openInNewTab, sendPostRequest, postData) {

    var newUrl;
    if (sendPostRequest) {
        newUrl = "post.html?url=" + encodeURIComponent(url) + "&postData=" + encodeURIComponent(postData.replace('${searchTerm}', searchTerm));
    } else {
        newUrl = url + searchTerm;
    }

    openUrl(newUrl, openInNewTab);
}

function loadXMLDoc(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseXML);
        }
    };
    xhr.send(null);
}

function renderNewsFeed(feedId, feedUrl, callback) {
    var xslUrl = chrome.extension.getURL("/xsl/NewsFeedControl_" + feedId + ".xsl");
    loadXMLDoc(xslUrl, function(xsl) {

        if (feedUrl == "") {
            feedUrl = chrome.extension.getURL("/xsl/rss_feed.xml");
        }
        loadXMLDoc(feedUrl, function(xml) {
            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsl);
            var resultDocument = xsltProcessor.transformToFragment(xml, document);

            document.getElementById("NewsFeedControl_" + feedId).appendChild(resultDocument);

            callback();
        });
    });
}

function openGetPostUrl(url, openInNewTab, sendPostRequest, postData) {

    var newUrl;
    if (sendPostRequest) {
        newUrl = "post.html?url=" + encodeURIComponent(url) + "&postData=" + encodeURIComponent(postData);
    } else {
        newUrl = url;
    }

    openUrl(newUrl, openInNewTab);
}

function openUrl(url, openInNewTab) {
    if (openInNewTab) {
        chrome.tabs.create({
            "url" : url,
            "selected" : true
        });
        window.close();
    } else {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.update(tab.id, {url : url, selected : true}, null);
            window.close();
        });
    }
}

function isBlank(string) {
    return string == null || string.replace(/(^\s+)|(\s+$)/g, "").length == 0;
}

function logoClick(inputTextId) {
    document.getElementById(inputTextId).focus();
}

function keyHandler(event, inputTextId, searchUrl, openInNewTab, sendPostRequest, postData, placeholderText, searchTermHandler) {
    if (event.keyCode == 13) {
        doSearch(inputTextId, searchUrl, openInNewTab, sendPostRequest, postData, placeholderText, searchTermHandler);
    }
}

function focusGained(e, textColor, placeholderText) {
    if (e.target.value == placeholderText) {
        e.target.value = "";
    }

    e.target.style.color = textColor;
}

function focusLost(e, textColor, placeholderText) {
    if (e.target.value == "") {
        e.target.value = placeholderText;
        e.target.style.color = textColor;
    }
}

function doSearch(inputTextId, searchUrl, openInNewTab, sendPostRequest, postData, placeholderText, searchTermHandler) {
    var searchTerm = document.getElementById(inputTextId).value;

    if (isBlank(searchTerm) || searchTerm == placeholderText) {
        return;
    }

    if (searchTermHandler) {
        searchTerm = searchTermHandler(searchTerm);
        document.getElementById(inputTextId).value = searchTerm;
    }

    openSearchUrl(searchUrl, searchTerm, openInNewTab, sendPostRequest, postData);
}

document.addEventListener('DOMContentLoaded', function () {

        var urlHandler = null;

        document.querySelector('#MenuItemContainer_id_5').addEventListener('click', function(){
            if (urlHandler) {
                urlHandler('http://www.gamers.ba/', function(url){
                    openGetPostUrl(url, true, true, '');
                });
            } else {
                openGetPostUrl('http://www.gamers.ba/', true, true, '');
            }
          });

      var sbe = document.getElementById('SearchBoxControl_InputText_id_1');
          sbe.focus();

      var searchTermHandler = null;

      sbe.addEventListener('keypress', function(){
          keyHandler(event, 'SearchBoxControl_InputText_id_1', 'http://gamers.ba/trazi.php?query=', true, false, '', '', searchTermHandler);
      });

      sbe.addEventListener('focus', function(){
          focusGained(event, 'rgba(0,0,0,1.0)', '');
      });

      sbe.addEventListener('blur', function(){
          focusLost(event, 'rgba(128,128,128,1.0)', '');
      });

      var logo = document.getElementById('SearchBoxControl_Logo_id_1');
      if (logo) {
          logo.addEventListener("click", function() {
              logoClick('SearchBoxControl_InputText_id_1');
          });
      }

      var button = document.getElementById('SearchBoxControl_Search_Ovl_id_1');
      if (button) {
          button.addEventListener("click", function() {
              doSearch('SearchBoxControl_InputText_id_1', 'http://gamers.ba/trazi.php?query=', true, false, '', '', searchTermHandler);
          });
      }

      renderNewsFeed('id_3', 'http://gamers.ba/feed', function(){
          var links = document.querySelectorAll('#NewsFeedControl_id_3 a');

          for (var i=0; i < links.length; i++) {
              links[i].addEventListener('click', function(e){
                  var url = e.target.getAttribute("href");
                  var openInNewTab = e.target.getAttribute("newtab") == "true";

                  openUrl(url, openInNewTab);
              });
          }

      });
});
