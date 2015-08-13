function Gale(translatableElementIdentifier)
{
    this.identifier = translatableElementIdentifier || 'translateid';
    
    this.previousLanguage = null;
    this.currentLanguage = null;
    
    this.translationSourceLoaded = false;
    
    this.translationRawSource = null;
    this.translationSource = null;
    this.translationMeta = null;
    
    this.availableLanguages = null;
    
    this.caching = true;
    this.elementCache = [];
    this.translateFromCache = true;
    
    this.debug = true;
    
    this.isSourceIndexTypeFigured = false;
    this.sourceIndexType = null;
    
    return this;
}

Gale.prototype.loadSourceFromJSON = function(url, callback)
{
    var self = this;
    self.translationSourceLoaded = false; // Should this be set to false?
    
    $.getJSON(url, function(data)
    {
        if(data && data.meta && data.translations)
        {
            self.translationRawSource = data;
            self.translationMeta = data.meta;
            
            if(!data.meta.availableLanguages)
            {
                console.log('Meta \'availableLanguages\' not found for JSON translation source, trying to parse directly from translations object');
                
                var availLanguages = [];

                for(var key in data.translations)
                {
                    availLanguages.push(key);   
                }
                
                if(availLanguages.length > 0)
                {
                    console.log('Parsing successful, but without availableLanguages-meta, availableLanguages will not be as exclusive');
                    self.availableLanguages = availLanguages;
                    self.translationMeta.availableLanguagesCount = availLanguages.length;
                }
                else
                {
                    console.log('Parsing failed. Is translations object empty or incorrectly structured'); 
                }
            }
            else
            {
                console.log('Meta \'availableLanguages\' found for JSON translation source, skipping translation object language parsing');   
                
                self.availableLanguages = data.meta.availableLanguages;
                self.translationMeta.availableLanguagesCount = Object.keys(data.meta.availableLanguages).length;
            }
            
            self.translationSource = data.translations;
            self.translationSourceLoaded = true;
            
            callback.call(self);
        }
        else
        {
            self.translationSourceLoaded = false;
            throw new Error('JSON cannot be null and / or it must include meta and data objects');   
        }     
    }).fail(function()
    {
        self.translationSourceLoaded = false;
        throw new Error('Failed to load translation source from JSON');
    });
}

Gale.prototype.translateApp = function(language, cacheonly)
{
    var self = this;
    var finalIndexFormat = null;
    var wasTranslated = false;
    
    if(!self.translationSourceLoaded)
    {
        throw new Error('Could not translate, translation source is not loaded!');
        return;
    }
     
    // Yuck, sorry for this code block
    if(self._figureTranslationIndexType() === 'normal')
    {
        if(self._figureSuppliedLanguage(language) == 'normal')
        {
            finalIndexFormat = language;   
        }
        else if(self._figureSuppliedLanguage(language) == 'shorthand')
        {
            finalIndexFormat = self._shorthandToNormal(language);
        }
        else if(self._figureSuppliedLanguage(language) == 'other')
        {
            finalIndexFormat = language;
        }
        else
        {
            throw new Error('Something is wrong with supplied language and / or translation source indexes!');   
        }
    }
    else if(self._figureTranslationIndexType() === 'shorthand')
    {
        if(self._figureSuppliedLanguage(language) == 'normal')
        {
            finalIndexFormat = self._normalToShorthand(language);   
        }
        else if(self._figureSuppliedLanguage(language) == 'shorthand')
        {
            finalIndexFormat = language;
        }
        else if(self._figureSuppliedLanguage(language) == 'other')
        {
            finalIndexFormat = language; 
        }
        else
        {
            
        }
    }
    else
    {
        throw new Error('Something is wrong with supplied language and / or translation source indexes!');   
    }
    
    console.log('Translation index type smart detect successful (finalIndexFormat = ' + finalIndexFormat + ')');
    
    if(cacheonly && self.elementCache.length > 0)
    {
        console.log('Translating cached elements (translateFromCache = ' + 
                    self.translateFromCache + '; elementCacheLength = ' + 
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
                console.log('Skipped ' + $this[0].tagName);
                return;   
            }
            
            // Actual translation happens here
            self._translateElement($this, finalIndexFormat);
            
            
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
        console.log('Translating noncached elements (caching = ' + self.caching + ')');
        
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
            self._translateElement($this, finalIndexFormat);


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

        if(self._figureSuppliedLanguage(language) === 'shorthand')
        {
            self.currentLanguage = self._shorthandToNormal(language);               
        }
        else
        {
            self.currentLanguage = language;
        }

        if(!self.previousLanguage)
        {
            self.previousLanguage = self.currentLanguage;
        }
    }
}

Gale.prototype.getTranslationsById = function(id)
{
    var self = this;
    var available = self.availableLanguages;
    var indexType = self._figureTranslationIndexType();
    var ret = {};
    
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
            }
        }
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


Gale.prototype._figureSuppliedLanguage = function(language)
{
    var self = this;
    
    
    var suppliedLanguage = null;
    var tmpLanguages = [];
    
    for(var key in self.translationSource)
    {
        tmpLanguages.push(key);   
    }
    
    if(Array.isArray(self.availableLanguages))
    {
        for(var i = 0; i < self.availableLanguages.length; i++)
        {
            if(self.availableLanguages[i] == language)
            {
                suppliedLanguage = 'other'; // Other, but working so continue
            }
        }
    }
    else
    {
        for(var key in self.availableLanguages)
        {
            if(key == language)
            {
                suppliedLanguage = 'normal'; // Normal, long format
            }
            else if(self.availableLanguages[key].shorthand == language)
            {
                suppliedLanguage = 'shorthand'; // Shorthand
            }
        }
    }
    
    if(!suppliedLanguage)
    {
        throw new Error('Could not figure supplied \'TO-language\'');
    }
    
    return suppliedLanguage;
}

Gale.prototype._translateElement = function(element, sourceIndex)
{
    var self = this;
    var $element = element;
    var source = self.translationSource[sourceIndex];
    
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

Gale.prototype._figureTranslationIndexType = function()
{
    var self = this;
    
    if(!self.isSourceIndexTypeFigured || !self.sourceIndexType)
    {
        var keysTotal = Object.keys(self.translationSource).length;
        var keySum = 0;
        var keyAvg = 0;

        for(var key in self.translationSource)   
        {
            keySum += key.length;
        }
        
        if(self.debug)
        {
            console.log('Total: ' + keysTotal);
            console.log('Sum: ' + keySum);
            console.log('Avg: ' + Math.ceil(keySum / keysTotal));
        }
        
        if(Math.ceil(keySum / keysTotal) > 4)
        {
            self.sourceIndexType = 'normal';   
        }
        else
        {
            self.sourceIndexType = 'shorthand';   
        }
        
        self.isSourceIndexTypeFigured = true;
        
        return self.sourceIndexType;
    }
    else
    {
        return self.sourceIndexType;
    }
}

Gale.prototype._normalToShorthand = function(normal)
{
    var self = this;
    
    return self.availableLanguages[normal].shorthand || null; 
}

Gale.prototype._shorthandToNormal = function(shorthand)
{
    var self = this;
    
    for(var key in self.availableLanguages)
    {
        if(self.availableLanguages[key].shorthand == shorthand)
        {
            return key;
        }
    }
    
    return null;
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