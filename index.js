var translator;

$(document).ready(function()
{
    translator = new Gale();
    translator.loadSourceFromJSON('translations.json', function() { translator.translateApp('english'); });
});