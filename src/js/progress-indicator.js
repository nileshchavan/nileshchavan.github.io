var progressIndicator = (function(){

    var $globalSpinner = document.getElementById('global-spinner');

    function show(){
        $globalSpinner.setAttribute('style', 'display: block');
    }

    function hide() {
        $globalSpinner.setAttribute('style', 'display: none');
    }

    return {
        show: show,
        hide: hide
    };
})();
