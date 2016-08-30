'use strict';

var twitchApp = (function(){

    // APP Configs
    var currentPage = 1;
    var pageSize = 10;
    var searchApi = 'https://api.twitch.tv/kraken/search/streams?limit={{pageSize}}&q={{query}}';

    // end APP Configs

    var searchResponse;

    var $list,
        $resultTemplate,
        $searchInput,
        $searchForm,
        $prevBtn,
        $nextBtn,
        $paginatorLabel,
        $resultsCount;

    // Search streams using twitch api
    // Observed some issues with the api where it doesn't return appropriate number of results & also
    // doesn't implement pagination correctly all the time
    // See issue: https://github.com/justintv/Twitch-API/issues/513

    function searchStreams(searchQuery){
        var searchUrl = searchApi.replace('{{query}}', searchQuery);
        searchUrl = searchUrl.replace('{{pageSize}}', pageSize);

        currentPage = 1;

        httpSvc.sendCorsReq(searchUrl, onSearchDataReceived);
    }

    function onSearchDataReceived(data){
        searchResponse = data;
        twitchApp.updateUI(data);
    };

    function paginationNext(){
        var paginationLinks = searchResponse._links;
        if(paginationLinks.next){
            httpSvc.sendCorsReq(paginationLinks.next, onSearchDataReceived);
            currentPage++;
        }
    }
    function paginationPrev(){
        var paginationLinks = searchResponse._links;
        if(paginationLinks.prev){
            httpSvc.sendCorsReq(paginationLinks.prev, onSearchDataReceived);
            currentPage--;
        }
    }

    function updateUI(){
        var streams = searchResponse.streams;

        var paginationLinks = searchResponse._links;

        console.log(paginationLinks.next);

        var totalPages = Math.ceil(searchResponse._total/pageSize);

        var enablePrevBtn = paginationLinks.hasOwnProperty('prev') && currentPage > 1;
        var enableNextBtn = paginationLinks.hasOwnProperty('next') && currentPage < totalPages;

        var renderedTemplate = '';

        streams.forEach(function(stream){
            var data = extractDataFromStream(stream);
            renderedTemplate += compileTemplate($resultTemplate.innerHTML, data);
        });

        var paginatorText = currentPage + '/' + totalPages;

        //Actual DOM Updates

        enableNextBtn ? $nextBtn.removeAttribute('disabled') : $nextBtn.setAttribute('disabled', 'true');
        enablePrevBtn ? $prevBtn.removeAttribute('disabled') : $prevBtn.setAttribute('disabled', 'true');

        $paginatorLabel.innerText = paginatorText;
        $resultsCount.innerText = 'Total Results: ' + searchResponse._total;
        $list.innerHTML = renderedTemplate;
    };

    var twitchAppInstance;

    function initialize(){
        $list = document.getElementsByClassName('results-list')[0];
        $resultTemplate = document.getElementById('stream-result-template');

        $searchInput = document.getElementById('searchBox');
        $searchForm = document.getElementById('searchForm');

        $prevBtn = document.getElementById('prevBtn');
        $nextBtn = document.getElementById('nextBtn');

        $paginatorLabel = document.querySelector('.paginator > label');
        $resultsCount = document.getElementsByClassName('total-results')[0];

        $prevBtn.setAttribute('disabled', 'true');
        $nextBtn.setAttribute('disabled', 'true');

        $prevBtn.addEventListener('click', paginationPrev);
        $nextBtn.addEventListener('click', paginationNext);

        twitchAppInstance = this;

        $searchForm.addEventListener('submit', onSubmitSearch);

        function onSubmitSearch(e){
            var query = $searchInput.value;
            twitchAppInstance.searchStreams(query);

            e.preventDefault();
        }

        var requestCallback = function(){
            progressIndicator.show('Loading results...');
        };

        var responseCallback = function(){
            progressIndicator.hide();
        };

        var httpInterceptor = new HttpInterceptor(requestCallback, responseCallback);
        httpSvc.registerInterceptor(httpInterceptor);
    }

    function compileTemplate(template, data){
        template = template.replace('{{imageUrl}}', data.imageUrl);
        template = template.replace('{{streamDisplayName}}', data.streamDisplayName);
        template = template.replace('{{gameName}}', data.gameName);
        template = template.replace('{{viewers}}', data.viewers);
        template = template.replace('{{streamDesc}}', data.streamDesc);

        return template;
    }

    function extractDataFromStream(stream){
        var data = {};

        data.imageUrl = stream.preview.medium;
        data.streamDisplayName = stream.channel.display_name;
        data.gameName = stream.game;
        data.viewers = stream.viewers + ' Viewers';
        data.streamDesc = stream.channel.status;

        return data;
    }

    return {
        updateUI: updateUI,
        initialize: initialize,
        searchStreams: searchStreams
    };
})();
