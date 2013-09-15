/**
 * Copyright (c) 2011, Robin Appelman <icewind1991@gmail.com>
 *               2013, Morris Jobke <morris.jobke@gmail.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

/**
 * Post the email address change to the server.
 */
function changeEmailAddress(){
    var emailInfo = $('#email');
    if (emailInfo.val() === emailInfo.defaultValue){
        return;
    }
    emailInfo.defaultValue = emailInfo.val();
    OC.msg.startSaving('#lostpassword .msg');
    var post = $( "#lostpassword" ).serialize();
    $.post( 'ajax/lostpassword.php', post, function(data){
        OC.msg.finishedSaving('#lostpassword .msg', data);
    });
}

/**
 * Post the display name change to the server.
 */
function changeDisplayName(){
    if ($('#displayName').val() !== '' ) {
        OC.msg.startSaving('#displaynameform .msg');
        // Serialize the data
        var post = $( "#displaynameform" ).serialize();
        // Ajax foo
        $.post( 'ajax/changedisplayname.php', post, function(data){
            if( data.status === "success" ){
                $('#oldDisplayName').text($('#displayName').val());
                // update displayName on the top right expand button
                $('#expandDisplayName').text($('#displayName').val());
            }
            else{
                $('#newdisplayname').val(data.data.displayName);
            }
            OC.msg.finishedSaving('#displaynameform .msg', data);
        });
        return false;
    }
}

function updateAvatar () {
	$headerdiv = $('#header .avatardiv');
	$displaydiv = $('#displayavatar .avatardiv');

	$headerdiv.css({'background-color': ''});
	$headerdiv.avatar(OC.currentUser, 32, true);
	$displaydiv.css({'background-color': ''});
	$displaydiv.avatar(OC.currentUser, 128, true);
}

function showAvatarCropper() {
	$cropper = $('#cropper');
	$cropper.prepend("<img>");
	$cropperImage = $('#cropper img');

	$cropperImage.attr('src', OC.Router.generate('core_avatar_get_tmp')+'?requesttoken='+oc_requesttoken+'#'+Math.floor(Math.random()*1000));

	// Looks weird, but on('load', ...) doesn't work in IE8
	$cropperImage.ready(function(){
		$('#displayavatar').hide();
		$cropper.show();

		$cropperImage.Jcrop({
			onChange: saveCoords,
			onSelect: saveCoords,
			aspectRatio: 1,
			boxHeight: 500,
			boxWidth: 500,
			setSelect: [0, 0, 300, 300]
		});
	});
}

function sendCropData() {
	cleanCropper();

	var cropperdata = $('#cropper').data();
	var data = {
		x: cropperdata.x,
		y: cropperdata.y,
		w: cropperdata.w,
		h: cropperdata.h
	};
	$.post(OC.Router.generate('core_avatar_post_cropped'), {crop: data}, avatarResponseHandler);
}

function saveCoords(c) {
	$('#cropper').data(c);
}

function cleanCropper() {
	$cropper = $('#cropper');
	$('#displayavatar').show();
	$cropper.hide();
	$('.jcrop-holder').remove();
	$('#cropper img').removeData('Jcrop').removeAttr('style').removeAttr('src');
	$('#cropper img').remove();
}

function avatarResponseHandler(data) {
	$warning = $('#avatar .warning');
	$warning.hide();
	if (data.status === "success") {
		updateAvatar();
	} else if (data.data === "notsquare") {
		showAvatarCropper();
	} else {
		$warning.show();
		$warning.text(data.data.message);
	}
}

$(document).ready(function(){
	$("#passwordbutton").click( function(){
		if ($('#pass1').val() !== '' && $('#pass2').val() !== '') {
			// Serialize the data
			var post = $( "#passwordform" ).serialize();
			$('#passwordchanged').hide();
			$('#passworderror').hide();
			// Ajax foo
			$.post( 'ajax/changepassword.php', post, function(data){
				if( data.status === "success" ){
					$('#pass1').val('');
					$('#pass2').val('');
					$('#passwordchanged').show();
				}
				else{
					$('#passworderror').html( data.data.message );
					$('#passworderror').show();
				}
			});
			return false;
		} else {
			$('#passwordchanged').hide();
			$('#passworderror').show();
			return false;
		}

	});

    $('#displayName').keyup(function(){
        if ($('#displayName').val() !== '' ){
            if(typeof timeout !== 'undefined'){
                clearTimeout(timeout);
            }
            timeout = setTimeout('changeDisplayName()',1000);
        }
    });


    $('#email').keyup(function(){
        if ($('#email').val() !== '' ){
            if(typeof timeout !== 'undefined'){
                clearTimeout(timeout);
            }
            timeout = setTimeout('changeEmailAddress()',1000);
        }
    });

	$("#languageinput").chosen();
	// Show only the not selectable optgroup
	// Choosen only shows optgroup-labels if there are options in the optgroup
	$(".languagedivider").hide();

	$("#languageinput").change( function(){
		// Serialize the data
		var post = $( "#languageinput" ).serialize();
		// Ajax foo
		$.post( 'ajax/setlanguage.php', post, function(data){
			if( data.status === "success" ){
				location.reload();
			}
			else{
				$('#passworderror').html( data.data.message );
			}
		});
		return false;
	});

	$('button:button[name="submitDecryptAll"]').click(function() {
		var privateKeyPassword = $('#decryptAll input:password[id="privateKeyPassword"]').val();
		OC.Encryption.decryptAll(privateKeyPassword);
	});

	$('#decryptAll input:password[name="privateKeyPassword"]').keyup(function(event) {
		var privateKeyPassword = $('#decryptAll input:password[id="privateKeyPassword"]').val();
		if (privateKeyPassword !== '' ) {
			$('#decryptAll button:button[name="submitDecryptAll"]').removeAttr("disabled");
			if(event.which === 13) {
				OC.Encryption.decryptAll(privateKeyPassword);
			}
		} else {
			$('#decryptAll button:button[name="submitDecryptAll"]').attr("disabled", "true");
		}
	});

	var uploadparms = {
		done: function(e, data) {
			avatarResponseHandler(data.result);
		}
	};

	$('#uploadavatarbutton').click(function(){
		$('#uploadavatar').click();
	});

	$('#uploadavatar').fileupload(uploadparms);

	$('#selectavatar').click(function(){
		OC.dialogs.filepicker(
			t('settings', "Select a profile picture"),
			function(path){
				$.post(OC.Router.generate('core_avatar_post'), {path: path}, avatarResponseHandler);
			},
			false,
			["image/png", "image/jpeg"]
		);
	});

	$('#removeavatar').click(function(){
		$.ajax({
			type:	'DELETE',
			url:	OC.Router.generate('core_avatar_delete'),
			success: function(msg) {
				updateAvatar();
			}
		});
	});

	$('#abortcropperbutton').click(function(){
		cleanCropper();
	});

	$('#sendcropperbutton').click(function(){
		sendCropData();
	});

	$('#pass2').strengthify({
		zxcvbn: OC.linkTo('3rdparty','zxcvbn/js/zxcvbn.js'),
		titles: [
			t('core', 'Very weak password'),
			t('core', 'Weak password'),
			t('core', 'So-so password'),
			t('core', 'Good password'),
			t('core', 'Strong password')
		]
	});
} );

OC.Encryption = {
	decryptAll: function(password) {
		OC.Encryption.msg.startDecrypting('#decryptAll .msg');
		$.post('ajax/decryptall.php', {password:password}, function(data) {
			if (data.status === "error") {
				OC.Encryption.msg.finishedDecrypting('#decryptAll .msg', data);
			} else {
				OC.Encryption.msg.finishedDecrypting('#decryptAll .msg', data);
			}
		}
		);
	}
}

OC.Encryption.msg={
	startDecrypting:function(selector){
		$(selector)
			.html( t('files_encryption', 'Decrypting files... Please wait, this can take some time.') )
			.removeClass('success')
			.removeClass('error')
			.stop(true, true)
			.show();
	},
	finishedDecrypting:function(selector, data){
		if( data.status === "success" ){
			 $(selector).html( data.data.message )
				.addClass('success')
				.stop(true, true)
				.delay(3000)
				.fadeOut(900);
		}else{
			$(selector).html( data.data.message ).addClass('error');
		}
	}
};

OC.msg={
	startSaving:function(selector){
		$(selector)
			.html( t('settings', 'Saving...') )
			.removeClass('success')
			.removeClass('error')
			.stop(true, true)
			.show();
	},
	finishedSaving:function(selector, data){
		if( data.status === "success" ){
			 $(selector).html( data.data.message )
				.addClass('success')
				.stop(true, true)
				.delay(3000)
				.fadeOut(900);
		}else{
			$(selector).html( data.data.message ).addClass('error');
		}
	}
};
