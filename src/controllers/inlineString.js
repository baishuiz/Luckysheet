import {getFontStyleByCell, textTrim} from "../global/getdata";
import {selectTextContent,selectTextContentCross,selectTextContentCollapse} from '../global/cursorPos';
import locale from '../locale/locale';
import Store from '../store';

export const inlineStyleAffectAttribute = {"bl":1, "it":1 , "ff":1, "cl":1, "un":1,"fs":1,"fc":1};

export function isInlineStringCell(cell){
    let isIs = cell && cell.ct!=null && cell.ct.t=="inlineStr" && cell.ct.s!=null && cell.ct.s.length>0;
    return isIs; 
}

export function isInlineStringCT(ct){
    let isIs = ct!=null && ct.t=="inlineStr" && ct.s!=null && ct.s.length>0;
    return isIs; 
}

export function updateInlineStringFormat(cell, attr, value, $input){
    // let s = Store.inlineStringEditCache;
    var  w = window.getSelection(); 
    var range;
    if(w.type=="None"){
        range = Store.inlineStringEditRange;
    }
    else{
        range = w.getRangeAt(0);
    } 
    

    // if(isInlineStringCell(cell)){
    //     if(Store.inlineStringEditCache==null){
    //         Store.inlineStringEditCache = JSON.parse(JSON.stringify(cell.ct.s));
    //     }
    // }
    // else{
    //     Store.inlineStringEditCache = [{
    //         v:cell.v
    //     }];
    // }

    let cac = range.commonAncestorContainer;
    let $textEditor;
    if(cac.id=="luckysheet-rich-text-editor"){
        $textEditor = $(cac);
    }
    else{
        $textEditor = $(cac).closest("#luckysheet-rich-text-editor");
    }
    let $functionbox = $(cac).closest("#luckysheet-functionbox-cell");

    if($textEditor.length==0 && $functionbox.length==0 && Store.inlineStringEditRange!=null){
        range = Store.inlineStringEditRange;
        cac = range.commonAncestorContainer;
        if(cac.id=="luckysheet-rich-text-editor"){
            $textEditor = $(cac);
        }
        else{
            $textEditor = $(cac).closest("#luckysheet-rich-text-editor");
        }
        $functionbox = $(cac).closest("#luckysheet-functionbox-cell");
    }

    if(range.collapsed===true){
        return;
    }

    let endContainer = range.endContainer, startContainer = range.startContainer;
    let endOffset = range.endOffset, startOffset = range.startOffset;

    if($textEditor.length>0){
         if(startContainer===endContainer){
            let span = startContainer.parentNode, spanIndex;
            
            let content = span.innerHTML;
            let left="" , mid="" , right="";
            let s1=0, s2=startOffset, s3 = endOffset, s4=content.length;
            left = content.substring(s1, s2);
            mid = content.substring(s2, s3);
            right = content.substring(s3, s4);

            let cont = "";
            if(left!=""){
                cont += "<span style='"+ span.style.cssText +"'>" + left + "</span>";
            }

            if(mid!=""){
                // let styleObj = {};
                // styleObj[attr] = value;
                // let s = getFontStyleByCell(styleObj, undefined, undefined, false);
                // let ukey = textTrim(s.substr(0, s.indexOf(':')));
                // let uvalue = textTrim(s.substr(s.indexOf(':')+1));
                // uvalue = uvalue.substr(0, uvalue.length-1);
                // let cssText = span.style.cssText;
                // cssText = removeClassWidthCss(cssText, attr);

                let cssText = getCssText(span.style.cssText, attr, value);
                
                cont += "<span style='"+ cssText +"'>" + mid + "</span>";
            }

            if(right!=""){
                cont += "<span style='"+ span.style.cssText +"'>" + right + "</span>";
            }

            if(startContainer.parentNode.tagName=="SPAN"){
                spanIndex = $textEditor.find("span").index(span);
                $(span).replaceWith(cont);
            }
            else{
                spanIndex = 0;
                $(span).html(cont);
            }
            

            let seletedNodeIndex = 0;
            if(s1==s2){
                seletedNodeIndex  = spanIndex;
            }
            else{
                seletedNodeIndex  = spanIndex+1;
            }

            selectTextContent($textEditor.find("span").get(seletedNodeIndex));
         }
         else{
            if(startContainer.parentNode.tagName=="SPAN" && endContainer.parentNode.tagName=="SPAN"){
                let startSpan = startContainer.parentNode, startSpanIndex;
                let endSpan = endContainer.parentNode, endSpanIndex;

                startSpanIndex = $textEditor.find("span").index(startSpan);
                endSpanIndex = $textEditor.find("span").index(endSpan);

                let startContent = startSpan.innerHTML, endContent = endSpan.innerHTML;
                let sleft="" , sright="", eleft="" , eright="";
                let s1=0, s2=startOffset, s3 = endOffset, s4=endContent.length;

                sleft = startContent.substring(s1, s2);
                sright = startContent.substring(s2, startContent.length);

                eleft = endContent.substring(0, s3);
                eright = endContent.substring(s3, s4);
                let spans = $textEditor.find("span");
                let replaceSpans = spans.slice(startSpanIndex, endSpanIndex+1);
                let cont = "";
                for(let i=0;i<startSpanIndex;i++){
                    let span = spans.get(i), content = span.innerHTML;
                    cont += "<span style='"+ span.style.cssText +"'>" + content + "</span>";
                }
                if(sleft!=""){
                    cont += "<span style='"+ startSpan.style.cssText +"'>" + sleft + "</span>";
                }

                if(sright!=""){
                    let cssText = getCssText(startSpan.style.cssText, attr, value);
                    cont += "<span style='"+ cssText +"'>" + sright + "</span>";
                }

                if(startSpanIndex<endSpanIndex){
                    for(let i=startSpanIndex+1;i<endSpanIndex;i++){
                        let span = spans.get(i), content = span.innerHTML;
                        cont += "<span style='"+ span.style.cssText +"'>" + content + "</span>";
                    }
                }

                if(eleft!=""){
                    let cssText = getCssText(endSpan.style.cssText, attr, value);
                    cont += "<span style='"+ cssText +"'>" + eleft + "</span>";
                }                
                
                if(eright!=""){
                    cont += "<span style='"+ endSpan.style.cssText +"'>" + eright + "</span>";
                }

                for(let i=endSpanIndex+1;i<spans.length;i++){
                    let span = spans.get(i), content = span.innerHTML;
                    cont += "<span style='"+ span.style.cssText +"'>" + content + "</span>";
                }

                $textEditor.html(cont);

                // console.log(replaceSpans, cont);
                // replaceSpans.replaceWith(cont);

                let startSeletedNodeIndex, endSeletedNodeIndex;
                if(s1==s2){
                    startSeletedNodeIndex  = startSpanIndex;
                    endSeletedNodeIndex = endSpanIndex;
                }
                else{
                    startSeletedNodeIndex  = startSpanIndex+1;
                    endSeletedNodeIndex = endSpanIndex+1;
                }

                spans = $textEditor.find("span");

                selectTextContentCross(spans.get(startSeletedNodeIndex), spans.get(endSeletedNodeIndex));
            }
         }
    }
    else if($functionbox.length>0){

    }
}

export function enterKeyControll(){
    var  w = window.getSelection(); 
    
    if(w.type=="None"){
        return
    }
    var range = w.getRangeAt(0);
    let cac = range.commonAncestorContainer;
    let $textEditor;
    if(cac.id=="luckysheet-rich-text-editor"){
        $textEditor = $(cac);
    }
    else{
        $textEditor = $(cac).closest("#luckysheet-rich-text-editor");
    }
    let $functionbox = $(cac).closest("#luckysheet-functionbox-cell");

    // if(range.collapsed===true){
    //     return;
    // }

    let endContainer = range.endContainer, startContainer = range.startContainer;
    let endOffset = range.endOffset, startOffset = range.startOffset;
    
    if($textEditor.length>0){
        let startSpan = startContainer.parentNode;
        let startSpanIndex = $textEditor.find("span").index(startSpan);
        if(range.collapsed===false){
            range.deleteContents();
        }

        let startContent = startSpan.innerHTML;
        let sleft="" , sright="";
        let s1=0, s2=startOffset;

        sleft = startContent.substring(s1, s2);
        sright = startContent.substring(s2, startContent.length);

        let cont = "<span style='"+ startSpan.style.cssText +"'>" + sleft + "\n" + sright + "</span>";
        let spanIndex;
        if(startContainer.parentNode.tagName=="SPAN"){
            spanIndex = $textEditor.find("span").index(startSpan);
            $(startSpan).replaceWith(cont);
        }
        else{
            spanIndex = 0;
            $(startSpan).html(cont);
        }

        selectTextContentCollapse($textEditor.find("span").get(spanIndex), startOffset+1);

    }
    else if($functionbox.length>0){

    }
}

export function updateInlineStringFormatOutside(cell, key, value){
    let s = cell.ct.s;
    for(let i=0;i<s.length;i++){
        let item = s[i];
        item[key] = value;
    }
}

export function convertSpanToShareString($dom){
    let styles = [], preStyleList, preStyleListString=null;
    for(let i=0;i<$dom.length;i++){
        let span = $dom.get(i);
        let styleList = convertCssToStyleList(span.style.cssText);

        let curStyleListString = JSON.stringify(styleList);
        let v = span.innerHTML;
        v = v.replace(/\n/g, "\r\n");

        if(curStyleListString==preStyleListString){
            preStyleList.v += v;
        }
        else{
            styleList.v = v;
            styles.push(styleList); 

            preStyleListString = curStyleListString;
            preStyleList = styleList;
        }
    }
    return styles;
}

export function convertCssToStyleList(cssText){
    if(cssText==null || cssText.length==0){
        return {};
    }
    let cssTextArray = cssText.split(";");
    let styleList = {    
        "ff":"Arial", //font family
        "fc":"#000000",//font color
        "fs":12,//font size
        "cl":0,//strike
        "un":0,//underline
        "bl":0,//blod
        "it":0,//italic
    };

    const _locale = locale();
    const locale_fontarray = _locale.fontarray;
    const locale_fontjson = _locale.fontjson;
    
    cssTextArray.forEach(s => {
        s = s.toLowerCase();
        let key = textTrim(s.substr(0, s.indexOf(':')));
        let value = textTrim(s.substr(s.indexOf(':') + 1));
        if(key=="font-weight"){
            if(value=="bold"){
                styleList["bl"] = 1;
            }
            else{
                styleList["bl"] = 0;
            }
        }

        if(key=="font-style"){
            if(value=="italic"){
                styleList["it"] = 1;
            }
            else{
                styleList["it"] = 0;
            }
        }

        if(key=="font-family"){
            let ff = locale_fontjson[value];
            if(ff==null){
                styleList["ff"] = value;
            }
            else{
                styleList["ff"] = ff;
            }
        }

        if(key=="font-size"){
            styleList["fs"] = parseInt(value);
        }

        if(key=="color"){
            styleList["fc"] = value;
        }

        if(key=="text-decoration"){
                styleList["cl"] = 1;
        }

        if(key=="border-bottom"){
            styleList["un"] = 1;
        }

        if(key=="lucky-strike"){
            styleList["cl"] = value;
        }

        if(key=="lucky-underline"){
            styleList["un"] = value;
        }

    });

    return styleList;
}

const luckyToCssName = {
    "bl":"font-weight",
    "it":"font-style",
    "ff":"font-family",
    "fs":"font-size",
    "fc":"color",
    "cl":"text-decoration",
    "un":"border-bottom",
}

function getClassWithcss(cssText, ukey){
    let cssTextArray = cssText.split(";");
    if(ukey==null || ukey.length==0){
        return cssText;
    }
    if(cssText.indexOf(ukey)>-1){
        for(let i=0;i<cssTextArray.length;i++){
            let s = cssTextArray[i];
            s = s.toLowerCase();
            let key = textTrim(s.substr(0, s.indexOf(':')));
            let value = textTrim(s.substr(s.indexOf(':') + 1));
            if(key==ukey){
                return value;
            }
        }
    }

    return "";
}

function upsetClassWithCss(cssText, ukey, uvalue){
    let cssTextArray = cssText.split(";");
    let newCss = "";
    if(ukey==null || ukey.length==0){
        return cssText;
    }
    if(cssText.indexOf(ukey)>-1){
        for(let i=0;i<cssTextArray.length;i++){
            let s = cssTextArray[i];
            s = s.toLowerCase();
            let key = textTrim(s.substr(0, s.indexOf(':')));
            let value = textTrim(s.substr(s.indexOf(':') + 1));
            if(key==ukey){
                newCss += key + ":" + uvalue + ";";
            }
            else if(key.length>0){
                newCss += key + ":" + value + ";";
            }
        }
    }
    else if(ukey.length>0){
        cssText += ukey + ":" + uvalue + ";"; 
        newCss = cssText;
    }

    return newCss;
}

function removeClassWidthCss(cssText, ukey){
    let cssTextArray = cssText.split(";");
    let newCss = "";
    let oUkey = ukey;
    if(ukey==null || ukey.length==0){
        return cssText;
    }
    if(ukey in luckyToCssName){
        ukey = luckyToCssName[ukey];
    }
    if(cssText.indexOf(ukey)>-1){
        for(let i=0;i<cssTextArray.length;i++){
            let s = cssTextArray[i];
            s = s.toLowerCase();
            let key = textTrim(s.substr(0, s.indexOf(':')));
            let value = textTrim(s.substr(s.indexOf(':') + 1));
            if(key==ukey || (oUkey=="cl" && key=="lucky-strike") || (oUkey=="un" && key=="lucky-underline") ){
                continue;
            }
            else if(key.length>0){
                newCss += key + ":" + value + ";";
            }
        }
    }
    else{
        newCss = cssText;
    }

    return newCss;
}

function getCssText(cssText, attr, value){
    let styleObj = {};
    styleObj[attr] = value;
    if(attr=="un"){
        let fontColor = getClassWithcss(cssText,"color");
        if(fontColor==""){
            fontColor = "#000000";
        }
        let fs = getClassWithcss(cssText,"font-size");
        if(fs==""){
            fs = 11;
        }
        fs = parseInt(fs);
        styleObj["_fontSize"] = fs;
        styleObj["_color"] = fontColor;
    }
    let s = getFontStyleByCell(styleObj, undefined, undefined, false);
    let ukey = textTrim(s.substr(0, s.indexOf(':')));
    let uvalue = textTrim(s.substr(s.indexOf(':')+1));
    uvalue = uvalue.substr(0, uvalue.length-1);
    // let cssText = span.style.cssText;
    cssText = removeClassWidthCss(cssText, attr);

    cssText = upsetClassWithCss(cssText, ukey, uvalue);

    return cssText;
}





