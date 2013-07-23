/**
 * plugin.js
 * process the @ action, like weibo @ behavior, user could at someone or some group in TinyMce editor
 * Author: zhouquan.yezq
 * Time: 7/17 2013
 */

tinymce.PluginManager.add('autoat', function(editor) {

	editor.on("keydown", function(e) {
		if (e.keyCode == 13) {
			if(disableEnter){
					e.stopPropagation();
			    return false;
			}
		}
	});

	editor.on("keyup", function(e) {
		if(e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 32 || e.keyCode==13){
		 	return false;
		}
		return handleAt(editor);

	});

	function handleAt(editor) {
		parseCurrentLine(editor, -1, '@', true);
	}

	/**
	* the empty interface method
	* objAux {JSON} {x: x-position, y: y-position,key: at-key-value}
	*/
	function processAtLogic(objAux){
		//to process at logic, you could at your logic here
	}

	/**
	* get Cursor Position
	* @param editor {TinyMce Editor instance}
	* @return {Rect}
	*/
	function getCursorPosition (editor) {
		//set a bookmark so we can return to the current position after we reset the content later
		var bm = editor.selection.getBookmark(0);
		//select the bookmark element
		var selector = "[data-mce-type=bookmark]";
		var bmElements = editor.dom.select(selector);
		//put the cursor in front of that element
		editor.selection.select(bmElements[0]);
		editor.selection.collapse();
		
		//add in my special span to get the index...
		//we won't be able to use the bookmark element for this because each browser will put id and class attributes in different orders.
		var elementID = "######cursor######";
		var positionString = '<span id="'+elementID+'"></span>';
		editor.selection.setContent(positionString);
		//get the content with the special span but without the bookmark meta tag
		var content = editor.getContent({format: "html"});
		//find the index of the span we placed earlier
		var index = content.indexOf(positionString);
		
		//remove my special span from the content
		var rect=editor.dom.getRect(elementID);
		//console.info(editor.dom.getRect(elementID));
		editor.dom.remove(elementID, false);
		//move back to the bookmark
		editor.selection.moveToBookmark(bm);
		return rect;
	};

	function parseCurrentLine(editor, end_offset, delimiter) {
		var  end, start, endContainer, bookmark, text, matches, prev, len;
		
		rng = editor.selection.getRng(true).cloneRange();
		text = rng.toString();
		endContainer = rng.endContainer;
		// Get a text node
		if (endContainer.nodeType != 3 && endContainer.firstChild) {
			while (endContainer.nodeType != 3 && endContainer.firstChild) {
				endContainer = endContainer.firstChild;
			}
		
			// Move range to text node
			if (endContainer.nodeType == 3) {
				rng.setStart(endContainer, 0);
				rng.setEnd(endContainer, endContainer.nodeValue.length);
			}
		}
		
		if (rng.endOffset == 1) {
			end = 1;
		} else {
			end = rng.endOffset - 1 - end_offset;
		}
		start = end;
		var index=end;
		var flag;
		do {
		try{
			if(index==-1) return;
			rng.setStart(endContainer, index);
			rng.setEnd(endContainer, end);
			index--;
			flag=/^@[a-zA-Z0-9-]*$/.test(rng.toString());
		}catch(e){
			break;
		}
		//loop until flag is true
		} while (!flag);
		
		/*console.info("rng text:",rng.toString());
		console.info("rng.startOffset:",rng.startOffset);
		console.info("rng.endOffset:",rng.endOffset);*/
		var node,rect,body,p_top,p_left,txtarr;
		
		txtarr = rng.toString().split("@");
		if(txtarr.length==0) {
			text="";
		}else {
			text=txtarr[1];
		}
		node=editor.selection.getNode();
		rect=getCursorPosition(editor);
		body=editor.getBody();
		p_top=editor.offset().top-body.scrollTop;
		p_left=editor.offset().left-body.scrollLeft;//$("#tinymce_container_ifr")
		disableEnter=true;
		processAtLogic.apply(null, [{x:rect.x+p_left,y:p_top+rect.y,key:text?text:""}])
	}
});
