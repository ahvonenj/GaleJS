var translator;

$(document).ready(function()
{
    translator = new AppTranslator();
    translator.loadSourceFromJSON('translations.json', function() { translator.translateApp('english'); });
});