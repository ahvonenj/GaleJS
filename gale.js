// GaleJS
// https://github.com/ahvonenj/GaleJS
// Jonah Ahvonen

;(function()
{

function Gale(translatableElementIdentifier)
{
    this.identifier = translatableElementIdentifier || 'translateid';
    
    this.previousLanguage = null;
    this.currentLanguage = null;
    
    this.translationSourceLoaded = false;
    
    this.translationRawSource = null;
    this.translationSource = null;
    this.inverseTranslationSource = null;
    this.translationMeta = null;
    
    this.availableLanguages = null;
    
    this.caching = true;
    this.elementCache = [];
    this.translateFromCache = true;
    
    this.debug = true;
    
    return this;
}

Gale.prototype.loadSourceFromJSON = function(url, callback)
{
    var self = this;
    self._processSource(url, callback);
}

Gale.prototype.loadSourceFromObject = function(object, callback)
{
    var self = this;
    self._processSource(object, callback);
}

Gale.prototype.translateApp = function(language, cacheonly)
{
    var self = this;
    var wasTranslated = false;
    
    if(!self.translationSourceLoaded)
    {
        throw new Error('Could not translate, translation source is not loaded!');
        return;
    }
    
    if(Object.keys(self.translationSource).indexOf(language) === -1)
    {
        throw new Error('Could not translate, supplied language not found in source');
        return;
    }
    
    if(cacheonly && self.elementCache.length > 0)
    {
        console.log('Translating cached elements (translateFromCache = ' + 
                    cacheonly + '; elementCacheLength = ' + 
                    self.elementCache.length + ')');
        
        if(self.debug) 
        { 
            console.time('Cached element translate time'); 
        }
        
        for(var key in self.elementCache)
        {
            var $this = self.elementCache[key];   
            
            if(typeof $this.data(self.identifier) === 'undefined' ||
               !$this.data(self.identifier) ||
               $.isEmptyObject($this.data(self.identifier)))
            {
                if(self.debug)
                    console.log('Skipped ' + $this[0].tagName);
                return;   
            }
            
            // Actual translation happens here
            self._translateElement($this, language);
            
            if(self.debug)
                console.log($this.data(self.identifier));
        }
        
        if(self.debug) 
        { 
            console.timeEnd('Cached element translate time'); 
        }
        
        wasTranslated = true;
    }
    else
    {
        console.log('Translating and caching noncached elements (caching = ' + cacheonly + ')');
        
        if(self.debug) 
        { 
            console.time('Noncached element translate time'); 
        }
        
        $('*').each(function(index, value)
        {
            var $this = $(this);

            if(typeof $this.data(self.identifier) === 'undefined' ||
               !$this.data(self.identifier) ||
               $.isEmptyObject($this.data(self.identifier)))
            {
                if(self.debug)
                    console.log('Skipped ' + $this[0].tagName);
                return;   
            }

            if(self.caching)
            {
                if(!self._inElementCache($this))
                {
                    self.elementCache.push($this);   
                }
            }
            
            // Actual translation happens here
            self._translateElement($this, language);

            if(self.debug)
                console.log($this.data(self.identifier));
        });
        
        if(self.debug) 
        { 
            console.timeEnd('Noncached element translate time'); 
        }
        
        wasTranslated = true;
    }
    
    if(wasTranslated)
    {
        if(self.previousLanguage)
        {
            self.previousLanguage = self.currentLanguage;
        }

        self.currentLanguage = language;

        if(!self.previousLanguage)
        {
            self.previousLanguage = self.currentLanguage;
        }
    }
}

Gale.prototype.getTranslationsById = function(id)
{
    var self = this;
    var ret = {};
    
    if(!self.translationSourceLoaded)
    {
        throw new Error('Could not get translation by id, translation source not loaded');   
        return;
    }
    
    for(var key in self.translationSource)
    {     
        var top = self.translationSource[key];
        
        for(var key2 in top)
        {
            var val = top[key2];
            
            if(key2 === id)
            {
                ret[key] = val;
            }
        }
    }
    
    return ret;
}

Gale.prototype.reverseTranslationLookup = function(text)
{
    var self = this;
    var ret = {};
    var found = false;
    var foundKey = null;
    
    if(!self.translationSourceLoaded)
    {
        throw new Error('Could not perform reverse translation lookup, translation source not loaded');   
        return;
    }   
    
    for(var key in self.translationSource)
    {
        var top = self.translationSource[key];   
        
        for(var key2 in top)
        {
            var val = top[key2];
                          
            if(val === text)
            {
                foundKey = key2;
                found = true;
                break;
            }
        }
        
        if(found)
            break;
    }
                          
    if(found)
    {
        for(var key in self.translationSource)
        {     
            var top = self.translationSource[key];

            for(var key2 in top)
            {
                var val = top[key2];

                if(key2 === foundKey)
                {
                    ret[key] = val;
                }
            }
        }
        
        return ret;
    }
    else
    {
        return {};   
    }
}

/*****************************************************************************
** PRIVATE / UTILITY
*****************************************************************************/


Gale.prototype._processSource = function(source, callback)
{
    var self = this;
    self.translationSourceLoaded = false;
    
    if(source !== null)
    {
        if(typeof source === 'object')
        {
            console.log('obbbjj');
            self._processSourceCallback(source, callback);
        }
        else if(typeof source === 'string')
        {
            console.log('jason');
            $.getJSON(source, function(returndata)
            {
                self._processSourceCallback(returndata, callback);
            }).fail(function()
            {
                self.translationSourceLoaded = false;
                throw new Error('Failed to load translation source from JSON');
            });
        }
        else
        {
            throw new Error('Could not determine translation source type');   
        }
        
             
    }
}

Gale.prototype._processSourceCallback = function(data, callback)
{
    var self = this;
    
    if(data && data.meta && data.translations)
    {
        self.translationRawSource = data;
        self.translationMeta = data.meta;

        if(!data.meta.availableLanguages)
        {
            throw new Error('Meta \'availableLanguages\' not found in translation source!');
        }
        else
        {
            console.log('Meta \'availableLanguages\' found for translation source');   

            self.availableLanguages = data.meta.availableLanguages;
            self.translationMeta.availableLanguagesCount = Object.keys(data.meta.availableLanguages).length;
        }

        self.translationSource = data.translations;
        self.inverseTranslationSource = self._invertSource();
        self.translationSourceLoaded = true;

        callback.call(self);
    }
    else
    {
        self.translationSourceLoaded = false;
        throw new Error('Translation source cannot be null and / or it must include meta and data objects');   
    }
}


Gale.prototype._translateElement = function(element, language)
{
    var self = this;
    var $element = element;
    var source = self.translationSource[language];
    
    if(typeof source[$element.data(self.identifier)] === 'undefined' ||
       !source[$element.data(self.identifier)])
    {
        console.log('\'' + language  + '\' Translation not found for id \'' + $element.data(self.identifier) + '\'');
    }
    
    if($element.is('input[type="button"], input[type="submit"]')) // Detect if element is button of some sort
    {
        if(self.debug)
            console.log('Translated element = BUTTON INPUT');
        
        $element.attr('value', source[$element.data(self.identifier)]);
    }
    else if($element.is('input[type="text"], input[type="password"], input[type="textarea"], input[type="textbox"]')) // Detect if element is textbox of some sort
    {
        if(self.debug)
            console.log('Translated element = TEXT INPUT');
        
        $element.attr('placeholder', source[$element.data(self.identifier)]);
    }
    else
    {
        $element.html(source[$element.data(self.identifier)]);
    }
    
}

Gale.prototype._inElementCache = function(element)
{
    var self = this;
    
    for(var key in self.elementCache)
    {
        if(self.elementCache[key].is(element))
        {
            return true;   
        }
    }
    
    return false;
}

Gale.prototype._invertSource = function()
{
    var self = this;
    var invertedSource = {};
    
    for(var key in self.translationSource)
    {
        var top = self.translationSource[key];
        invertedSource[key] = {};
        
        var iTop = invertedSource[key];
        
        for(var key2 in top)
        {
            iTop[top[key2]] = key2;
        }
    }
    
    return invertedSource;
}


if (typeof module !== "undefined" && module.exports) // Node: Export function
{
    module.exports = Gale;
}

else if (typeof define === 'function' && define.amd) // AMD/requirejs: Define the module
{
    define(function () {return Gale;});
}

else // Browser: Expose to window
{
    window.Gale = Gale;
}

}());