
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~      Functions     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

function MM_openBrWindow(theURL,winName,features) { //v2.0
  myWin = window.open(theURL,winName,features);
  myWin.focus();
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~     Flash / Image Replacer    ~~~~~~~~~~~~~~~                    var MM_contentVersion = 5;var MM_FlashCanPlay = 0;var plugin = (navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) ? navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin : 0;if ( plugin ) {	    var words = navigator.plugins["Shockwave Flash"].description.split(" ");	    for (var i = 0; i < words.length; ++i) {		if (isNaN(parseInt(words[i]))) {			continue;		}		var MM_PluginVersion = words[i]; 	    }	    MM_FlashCanPlay = MM_PluginVersion >= MM_contentVersion;}else if (navigator.userAgent && navigator.userAgent.indexOf("MSIE")>=0 && (navigator.appVersion.indexOf("Win") != -1)) {	document.write('<SCR' + 'IPT LANGUAGE="VBScript">\n '); //FS hide this from IE4.5 Mac by splitting the tag	document.write('on error resume next\n ');	document.write('MM_FlashCanPlay = ( IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash." & MM_contentVersion)))\n');	document.write('</SCR' + 'IPT>\n ');}// End of Flash Detection Script // Function to show the gif banner if not users browser is not able to display flash function showgif(imagename,w,h){ 	document.open();	document.write('<img src="' + imagename + '" width="' + w + '" height="' + h + '" border="0" galleryimg="no">');	document.close();  }// Script to show the flash banner if the users browser supports flash function showflash(flashname,w,h){ 	document.open();	document.write('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"  codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0" width="' + w + '" height="' + h + '" id=ShockwaveFlash1>');	document.write('<param name="movie" value="' + flashname + '">');	document.write('<param name="quality" value="high">');	document.write('<embed src="' + flashname + '" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="' + w + '" height="' + h + '" align="absmiddle"></embed>');	document.write('</object>');	document.close();}



