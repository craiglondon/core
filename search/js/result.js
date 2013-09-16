OC.search.catagorizeResults=function(results){
	var types={};
	for(var i=0;i<results.length;i++){
		var type=results[i].type;
		if(!types[type]){
			types[type]=[];
		}
		types[type].push(results[i]);
	}
	return types;
}
OC.search.hide=function(){
	$('#searchresults').hide();
	if($('#searchbox').val().length>2){
		$('#searchbox').val('');
	};
}
OC.search.showResults=function(results){
	if(results.length==0){
		return;
	}
	if(!OC.search.showResults.loaded){
		var parent=$('<div/>');
		$('body').append(parent);
		parent.load(OC.filePath('search','templates','part.results.php'),function(){
			OC.search.showResults.loaded=true;
			$('#searchresults').click(function(event){
				OC.search.hide();
				event.stopPropagation();
			});
			$(document).click(function(event){
				OC.search.hide();
			});
			OC.search.lastResults=results;
			OC.search.showResults(results);
		});
	}else{
		var types=OC.search.catagorizeResults(results);
		$('#searchresults').show();
		$('#searchresults tr.result').remove();
		var index=0;
		for(var name in types){
			var type=types[name];
			if(type.length>0){
				for(var i=0;i<type.length;i++){
					var row=$('#searchresults tr.template').clone();
					row.removeClass('template');
					row.addClass('result');
					if (i == 0){
						row.children('td.type').text(name);
					}
					row.find('td.result a').attr('href',type[i].link);
					row.find('td.result div.name').text(type[i].name);
					row.find('td.result div.text').text(type[i].text);
					row.data('index',index);
					index++;
					if(OC.search.customResults[name]){//give plugins the ability to customize the entries in here
						OC.search.customResults[name](row,type[i]);
					}
					$('#searchresults tbody').append(row);
				}
			}
		}
	}
}
OC.search.showResults.loaded=false;

OC.search.renderCurrent=function(){
	if($('#searchresults tr.result')[OC.search.currentResult]){
		var result=$('#searchresults tr.result')[OC.search.currentResult];
		$('#searchresults tr.result').removeClass('current');
		$(result).addClass('current');
	}
}

//
// customize search results, currently replaces a technical type with a more human friendly version
// TODO implement search result renderers instead of changing results after adding them to the DOM
//
OC.search.customResults.file = function (row, item) {
	if(row.children('td.type').text() === 'file') {
		row.children('td.type').text(t('lib','Files'));
	};
}
OC.search.customResults.folder = function (row, item) {
	if(row.children('td.type').text() === 'folder') {
		row.children('td.type').text(t('lib','Folders'));
	};
}
OC.search.customResults.image = function (row, item) {
	if(row.children('td.type').text() === 'image') {
		row.children('td.type').text(t('lib','Images'));
	};
}
OC.search.customResults.audio = function (row, item) {
	if(row.children('td.type').text() === 'audio') {
		row.children('td.type').text(t('lib','Audio'));
	};
}
