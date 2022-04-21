var g_UA = navigator.userAgent.toLowerCase();
var g_NETSCAPE = (g_UA.indexOf("netscape")>0);
var g_NETSCAPE8 = (g_UA.indexOf("netscape/8")>0);
var g_NETSCAPE_LESS8 = (g_NETSCAPE && !g_NETSCAPE8);
var g_FIREFOX = (g_UA.indexOf("firefox")>0) 
var g_OPERA = (g_UA.indexOf("opera")>0)
var g_WEBTV = (g_UA.indexOf("webtv")>0)
var g_IE = (!g_OPERA && !g_WEBTV && g_UA.indexOf("msie")>0); //navigator.userAgent contains "msie" for Opera and WebTv too!!
var g_SAFARI = (g_UA.indexOf("safari") != -1);
var g_KONQUEROR = (g_UA.indexOf("konqueror") != -1);
var g_USE_NEW_CONTENT_MANAGER = (document.getElementById && document.designMode && !g_SAFARI && !g_KONQUEROR && !g_NETSCAPE_LESS8);
var g_USE_FCK_CONTENT_MANAGER = (!g_SAFARI && !g_KONQUEROR && !g_NETSCAPE_LESS8 && !g_OPERA);
var g_FormatDate = "MM/DD/YYYY";
var g_IE_VERSION5 = g_IE && (g_UA.charAt(navigator.appVersion.indexOf("msie") + 5) >= 5);
var g_WIN16 = (navigator.platform.indexOf("Win16") > 0);
var g_MAC = (g_UA.indexOf("mac")>0);

var g_SectionNameNotAcceptedChars = new Array("\\", "/", ":", "*", "?", "\"", "<", ">", "|", ".");

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function isEmpty(str)
{		
	if(g_IE)
	{		
		if(str=="")
			return true;
		var re = /(\S+)/gi;
		var t = re.test(str);
		return !t;
	}
	else
	{		
		if(str=="")	
			return true;
		return false;
	}
}

function doRefresh()
{
	document.location.reload();
}

function doNothing()
{		
}	

function doChangeBGColor(oID, sNewColor){
	if(document.getElementById(oID)){
		document.getElementById(oID).style.background = sNewColor;
		document.getElementById(oID).style.backgroundRepeat = "repeat-x";
	}
}
function doShowArrows(oID, blnSwitch){
	if(document.getElementById(oID)){
		document.getElementById(oID).style.display = blnSwitch ? "none" : "block";
	}
}
function doManageProduct(iProductID, iMaxProducts){
	var sProductTitle = "trProdTitle_";
	var sProductBody  = "trProdBody_";
	var sState_on = "_on";
	var sState_off = "_off";
	
	// hide the other products
	for(iIndex = 1; iIndex <= iMaxProducts; iIndex++){
		document.getElementById(sProductTitle + iIndex + sState_off).style.display = "block";
		document.getElementById(sProductTitle + iIndex + sState_on).style.display = "none";
		document.getElementById(sProductBody + iIndex).style.display = "none";
	}
	
	// show product
	document.getElementById(sProductTitle + iProductID + sState_off).style.display = "none";
	document.getElementById(sProductTitle + iProductID + sState_on).style.display = "block";
	document.getElementById(sProductBody + iProductID).style.display = "block";
}

function doRestore(optionID){
	var sOptionBegin = "tdOptionBegin";
	var sOptionBody = "tdOptionBody";
	if(document.getElementById(sOptionBegin + optionID)){
		document.getElementById(sOptionBegin + optionID).className = "topMenuTabStart";
	}
	if(document.getElementById(sOptionBody + optionID)){
		document.getElementById(sOptionBody + optionID).className = "topMenuTab";
	}
}
function doHover(optionID){
	var sOptionBegin = "tdOptionBegin";
	var sOptionBody = "tdOptionBody";
	if(document.getElementById(sOptionBegin + optionID)){
		document.getElementById(sOptionBegin + optionID).className = "topMenuTabStart_h";
	}
	if(document.getElementById(sOptionBody + optionID)){
		document.getElementById(sOptionBody + optionID).className = "topMenuTab_h";
	}
}

function openPopup(urlLoc, sWindowName, sTitle, wSpace, hSpace) {
	var width = (screen.availWidth - wSpace)/2;
	var height = (screen.availHeight - hSpace)/2;
	
	windowprops = 'left=' + width + ',top=' + height + ',width=' + wSpace + ',height=' + hSpace + ',menubar=0,toolbar=0,status=0,location=0,scrollbars=0,resizable=0';
	popupWindow = open(urlLoc, sWindowName, windowprops);
	
	if (popupWindow.opener == null) 
			popupWindow.opener = self;
	//popupWindow.document.title = sTitle;
}
function newWindow(urlLoc) {
	windowprops = 'menubar=0,toolbar=0,status=0,location=1,scrollbars=1,resizable=1';
	newWindow = open(urlLoc, 'Roku', windowprops);
	
	if (newWindow.opener == null) 
			newWindow.opener = self;
	
}
function newWindow_WH(urlLoc, wSpace, hSpace) {
	var width = (screen.availWidth - wSpace)/2;
	var height = (screen.availHeight - hSpace)/2;
	
	
	windowprops = 'left=' + width + ',top=' + height + ',width=' + wSpace + ',height=' + hSpace + ',menubar=0,toolbar=0,status=0,location=1,scrollbars=1,resizable=1';
	newWindow = open(urlLoc, 'Roku', windowprops);
	
	if (newWindow.opener == null) 
			newWindow.opener = self;
	
}
function doRegister(){
	if(document.getElementById("divPg1")){
		if(document.getElementById("divPg1").style.display == "block"){
			if(document.getElementById("divPg2")){
				document.getElementById("divPg1").style.display = "none";
				document.getElementById("divPg2").style.display = "block";
			}	
		}
		else{
			alert('Do Register!');
		}
	}
}
function ValidNewsletter(){
	if (document.theForm.email.value.length>0){ 
		var valEmail = RemoveSpaces(document.theForm.email.value);

		if (isEmail(valEmail)==false) {
				alert("Please enter a valid E-Mail address, like: name@companyname.com! ");
				document.theForm.email.focus();
				return false;
		}  
	}
	else{
		alert("Please enter a E-Mail address! ");
		document.theForm.email.focus();
		return false;
	}
	return true;
}

// isEmail
function isEmail(string) {
    if (string.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)
        return true;
    else
        return false;
}

//RemoveSpaces
function RemoveSpaces(field) {
	var xpos =0;
	var xlen =field.length;
	var xpos1 =0;
	var xpos2 =xlen;

	for (var i=0; i < xlen; i++) {
		temp = "" + field.substring(i, i+1);
		if (temp == " ") {xpos++;}
		else {var xpos1=xpos; break; }
	}
	field = field.substring(xpos1, xlen)
	var xlen1 = field.length;

	for (var i=0; i < xlen1; i++) {
		temp = "" + field.substring(i, i+1);
		if (temp != " ") {xpos1++;}
		else {xpos2=i;break;  }
	}
	field = field.substring(0, xpos2)
	return field;
}

//
function doBuy(lnkID,pID){
	if(document.getElementById(pID)){
		if(document.getElementById(pID).style.display == "block"){
			document.getElementById(pID).style.display = "none";
			if(document.getElementById(lnkID)){
				document.getElementById(lnkID).className = "";
			}
		}
		else{
			document.getElementById(pID).style.display = "block";
			if(document.getElementById(lnkID)){
				document.getElementById(lnkID).className = "colGreenBold";
			}
		}
	}
}
function doShowHide(divID){
	if(document.getElementById(divID)){
		if(document.getElementById(divID).style.display == "block"){
			document.getElementById(divID).style.display = "none";
		}
		else{
			document.getElementById(divID).style.display = "block";
		}
	}
}
// string utils
function isStrEmpty(s){ return ((s == null) || (s.length == 0))}
function isWhitespace (s){
	var reWhitespace = /^\s+$/;
    return (isStrEmpty(s) || reWhitespace.test(s));
}
// phone valid
//---------------- valid phone ----------------
// VARIABLE DECLARATIONS

var digits = "0123456789";

// whitespace characters
var whitespace = " \t\n\r";

// decimal point character differs by language and culture
var decimalPointDelimiter = "."

// non-digit characters which are allowed in phone numbers
var phoneNumberDelimiters = "()-./ ";

// characters which are allowed in US phone numbers
var validUSPhoneChars = digits + phoneNumberDelimiters;

// U.S. phone numbers have 10 digits.
// They are formatted as 123-456-7890 or (123) 456-7890.
var digitsInUSPhoneNumber = 10;

// CONSTANT STRING DECLARATIONS

// m = "missing"

var mPrefix = "You did not enter a value into the "
var mSuffix = " field. This is a required field. Please enter it now."

// s --- "string"

var sPhone = "Phone Number"

// i is an abbreviation for "invalid"
var iUSPhone = "This field must be a 10 digit U.S. phone number (like 415-555-1212). Please reenter it now."
// p is an abbreviation for "prompt"
var pEntryPrompt = "Please enter a "
var pUSPhone = "10 digit U.S. phone number (like 415-555-1212)."
var defaultEmptyOK = false

// Check whether string s is empty.

function isEmpty(s)
{   return ((s == null) || (s.length == 0))
}

function stripCharsInBag (s, bag)

{   var i;
    var returnString = "";

    // Search through string's characters one by one.
    // If character is not in bag, append to returnString.

    for (i = 0; i < s.length; i++)
    {   
        // Check that current character isn't whitespace.
        var c = s.charAt(i);
        if (bag.indexOf(c) == -1) returnString += c;
    }

    return returnString;
}
function isDigit (c)
{   return ((c >= "0") && (c <= "9"))
}
function isInteger (s)

{   var i;

    if (isEmpty(s)) 
       if (isInteger.arguments.length == 1) return defaultEmptyOK;
       else return (isInteger.arguments[1] == true);

    // Search through string's characters one by one
    // until we find a non-numeric character.
    // When we do, return false; if we don't, return true.

    for (i = 0; i < s.length; i++)
    {   
        // Check that current character is number.
        var c = s.charAt(i);

        if (!isDigit(c)) return false;
    }

    // All characters are numbers.
    return true;
}

function reformat (s)

{   var arg;
    var sPos = 0;
    var resultString = "";

    for (var i = 1; i < reformat.arguments.length; i++) {
       arg = reformat.arguments[i];
       if (i % 2 == 1) resultString += arg;
       else {
           resultString += s.substring(sPos, sPos + arg);
           sPos += arg;
       }
    }
    return resultString;
}


function isUSPhoneNumber (s)
{   if (isEmpty(s)) 
       if (isUSPhoneNumber.arguments.length == 1) return defaultEmptyOK;
       else return (isUSPhoneNumber.arguments[1] == true);
    return (isInteger(s) && s.length == digitsInUSPhoneNumber)
}

// Notify user that contents of field theField are invalid.
// String s describes expected contents of theField.value.
// Put select theField, pu focus in it, and return false.


function warnInvalid (theField, s)
{   theField.focus()
    theField.select()
    alert(s)
    return false
}


function reformatUSPhone (USPhone)
{   return (reformat (USPhone, "", 3, "-", 3, "-", 4))
}


function checkUSPhone (theField, emptyOK)
{   if (checkUSPhone.arguments.length == 1) emptyOK = defaultEmptyOK;
    if ((emptyOK == true) && (isEmpty(theField.value))) return true;
    else
    {  var normalizedPhone = stripCharsInBag(theField.value, phoneNumberDelimiters)
       if (!isUSPhoneNumber(normalizedPhone, false)) 
          return warnInvalid (theField, iUSPhone);
       else 
       {  // if you don't want to reformat as (123) 456-789, comment next line out
          theField.value = reformatUSPhone(normalizedPhone)
          return true;
       }
    }
}

// select all the checkboxes
function DoCheckAll(oChkAll) {
	with(document.forms[0]) {

		for(var iCount = 0; iCount < chkUsers.length; iCount ++) {
			var oChk = chkUsers[iCount];
			chkUsers[iCount].click();
			chkUsers[iCount].checked = oChkAll.checked;
		}
		if(chkUsers.length > 0) chkUsers[0].focus();
	}
}

//-----------form valid
function ValidContact(){
	if (isWhitespace(document.contactsupport.name.value)){ 
		alert("Please enter your Name! ");
		document.contactsupport.name.focus();
		return false;	
	}
	if (isWhitespace(document.contactsupport.emailaddr.value)){ 
		alert("Please enter your Email Address! ");
		document.contactsupport.emailaddr.focus();
		return false;	
	}
	if (document.contactsupport.emailaddr.value.length>0){ 
		var valEmail = RemoveSpaces(document.contactsupport.emailaddr.value);

		if (isEmail(valEmail)==false) {
				alert("Please enter a valid E-Mail address, like: name@companyname.com! ");
				document.contactsupport.emailaddr.focus();
				return false;
		}  
	}
	if (isWhitespace(document.contactsupport.phone.value)){ 
		//alert("Please enter your Phone Number! ");
		//document.contactsupport.phone.focus();
		//return false;	
	}
	else{
		if (!checkUSPhone(document.contactsupport.phone)){
			document.contactsupport.phone.focus();
			return false;
		}
	}
	if ( (document.contactsupport.c_product.options[document.contactsupport.c_product.options.selectedIndex].value)=="")	{
		alert("Please choose a Product! ");
		document.contactsupport.c_product.focus();
		return false;	
	}
	if ( (document.contactsupport.questiontype.options[document.contactsupport.questiontype.options.selectedIndex].value)=="")	{
		alert("Please choose a Question Type! ");
		document.contactsupport.questiontype.focus();
		return false;	
	}
	if ( (document.contactsupport.version.options[document.contactsupport.version.options.selectedIndex].value)=="")	{
		alert("Please choose a Software Version! ");
		document.contactsupport.version.focus();
		return false;	
	}
	if ( (document.contactsupport.os.options[document.contactsupport.os.options.selectedIndex].value)=="")	{
		alert("Please choose the Computer Operating System! ");
		document.contactsupport.os.focus();
		return false;	
	}
	/*if (isWhitespace(document.contactsupport.networkeq.value)){ 
		alert("Please enter the makes and models of equipment used! ");
		document.contactsupport.networkeq.focus();
		return false;	
	}*/
	if (isWhitespace(document.contactsupport.description.value)){ 
		alert("Please describe your question! ");
		document.contactsupport.description.focus();
		return false;	
	}
	
	return true;
}
function doSubmit(){
	if(ValidContact()){
		document.contactsupport.from.value = document.contactsupport.emailaddr.value;
		document.contactsupport.email.value = "support@rokulabs.com";
		document.contactsupport.data.value = "text/html`Data`CHARSET`";;
		document.forms['contactsupport'].submit();
		return false;
		
	}
}

function ValidAffiliate(){
	if (isWhitespace(document.frmAffiliate.sname.value)){ 
		alert("Please enter the Station Name! ");
		document.frmAffiliate.sname.focus();
		return false;	
	}
	if (isWhitespace(document.frmAffiliate.surl.value)){ 
		alert("Please enter the Station URL! ");
		document.frmAffiliate.surl.focus();
		return false;	
	}
	if (isWhitespace(document.frmAffiliate.cname.value)){ 
		alert("Please enter the Contact Name! ");
		document.frmAffiliate.cname.focus();
		return false;	
	}
	
	if (isWhitespace(document.frmAffiliate.cemail.value)){ 
		alert("Please enter the Contact Email Address! ");
		document.frmAffiliate.cemail.focus();
		return false;	
	}
	if (document.frmAffiliate.cemail.value.length>0){ 
		var valEmail = RemoveSpaces(document.frmAffiliate.cemail.value);

		if (isEmail(valEmail)==false) {
				alert("Please enter a valid E-Mail address, like: name@companyname.com! ");
				document.frmAffiliate.cemail.focus();
				return false;
		}  
	}
	if (isWhitespace(document.frmAffiliate.cphone.value)){ 
		alert("Please enter the Contact Phone Number! ");
		document.frmAffiliate.cphone.focus();
		return false;	
	}
	else{
		if (!checkUSPhone(document.frmAffiliate.cphone)){
			document.frmAffiliate.cphone.focus();
			return false;
		}
	}
	
	if (isWhitespace(document.frmAffiliate.address1.value)){ 
		alert("Please enter the Shipping Address! ");
		document.frmAffiliate.address1.focus();
		return false;	
	}
	if (isWhitespace(document.frmAffiliate.city.value)){ 
		alert("Please enter the City! ");
		document.frmAffiliate.city.focus();
		return false;	
	}
	if (isWhitespace(document.frmAffiliate.state.value)){ 
		alert("Please enter the State! ");
		document.frmAffiliate.state.focus();
		return false;	
	}
	if (isWhitespace(document.frmAffiliate.zip.value)){ 
		alert("Please enter the Zip Code! ");
		document.frmAffiliate.zip.focus();
		return false;	
	}
	if (isWhitespace(document.frmAffiliate.country.value)){ 
		alert("Please enter the Country! ");
		document.frmAffiliate.country.focus();
		return false;	
	}
	
	if (isWhitespace(document.frmAffiliate.stats.value)){ 
		alert("Please enter the General Description of Station and Target Audience! ");
		document.frmAffiliate.stats.focus();
		return false;	
	}
	
	if (isWhitespace(document.frmAffiliate.dailyvisitors.value)){ 
		alert("Please enter the Average Unique Visitors Daily! ");
		document.frmAffiliate.dailyvisitors.focus();
		return false;	
	}
	
	if (isWhitespace(document.frmAffiliate.ttsl.value)){ 
		alert("Please enter the Total Time Spent Listening (TTSL)! ");
		document.frmAffiliate.ttsl.focus();
		return false;	
	}
	
	if(document.frmAffiliate.agree.checked == false){
		alert("Please read the Roku SoundBridge Affiliate Agreement! ");
		return false;
	}
	return true;
}
function doSubmitAffiliate(){
	if(ValidAffiliate()){
		document.frmAffiliate.from.value = document.frmAffiliate.cemail.value;
		document.frmAffiliate.email.value = "affiliate@rokulabs.com";
		document.frmAffiliate.data.value = "text/html`Data`CHARSET`";;
		document.forms['frmAffiliate'].submit();
		return false;
		
	}
}