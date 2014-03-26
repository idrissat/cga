projUtils = {
DEGREES_TO_RADIANS: function(degreeValue){
		return (degreeValue/180)*Math.PI;
	},
RADIANS_TO_DEGREES: function(radianValue){
		return (radianValue*180)/Math.PI;
	},
METER_TO_USFOOT: function(meterValue){
		return meterValue/0.3048006096012192;
	},
USFOOT_TO_METER: function(usfootValue){
		return usfootValue*0.3048006096012192;
	},
EARTH_RADIUS: 6378137.0,
SPC83Direct: function(){
    var XY = function(X,Y) {
        this.x=X, this.y=Y;
    };
	var args = Array.prototype.slice.call(arguments);
	if(args.length !== 3){
		throw new Error('argument list should be longitude,latitude,isUSFoot');
		return;
	}
	if((parseFloat(args[0]) > 180.0) || (parseFloat(args[0]) < -180.0)){
		throw new Error('longitude should be [-180,180]')
		return;
	}
	
	if((parseFloat(args[1]) > 90.0) || (parseFloat(args[1]) < -90.0)){
		throw new Error('latitude should be [-90,90]')
		return;
	}

	if(!(args[2] === true) && !(args[2] === false)){
		throw new Error('isUSFoot value should be true or false')
		return;
	}

//Passed all the check points
    var longitude = projUtils.DEGREES_TO_RADIANS(args[0]);
    var latitude = projUtils.DEGREES_TO_RADIANS(args[1]);
    var lon_0 = projUtils.DEGREES_TO_RADIANS(-74.5); //central meridien for NJ
    var lat_0 = projUtils.DEGREES_TO_RADIANS(38.83333333333334);
    var  k0 = 0.9999;
    //GRS80 parameters
    var a = 6378137.0;
    var b = 6356752.31414;
    var e = Math.sqrt((a*a-b*b)/(a*a));
    var f = (a-b)/a;//1.0/e;
    var se = e*e/(1-e*e);
    //double S0 = 4299571.6693; //NJ
    var N0 = 0.0;
    var E0= 150000.0;
    var n = f/(2.0-f);//(a-b)/(a+b);
    var sn = se*se*Math.cos(latitude)*Math.cos(latitude);
    
    var t =Math.tan(latitude);
    var r = a*(1-n)*(1-n*n)*(1+9*n*n/4 + 225*n*n*n*n/64);
    var u2 = -3.0*n/2.0 + 9.0*n*n*n/16.0;
    var u4 = 15.0*n*n/16.0 -15.0*n*n*n*n/32.0;
    var u6 = -35.0*n*n*n/48.0;
    var u8 = 315.0*n*n*n*n/512.0;
    var U0 = 2*(u2-2*u4+3*u6 - 4*u8);
    var U2 = 8*(u4-4*u6+10*u8);
    var U4 = 32*(u6-6*u8);
    var U6 = 128*u8;
    
    var L = (longitude - lon_0)*Math.cos(latitude);
    
    var w = latitude + Math.sin(latitude)*Math.cos(latitude)*
        (U0 +
             Math.cos(latitude)*Math.cos(latitude)*
                  (U2 +
                        Math.cos(latitude)*Math.cos(latitude)*
                            (U4 +
                                U6*Math.cos(latitude)*Math.cos(latitude)
                    )
                   )
         );
    
    var w0 = lat_0 + Math.sin(lat_0)*Math.cos(lat_0)*
    (U0 +
     Math.cos(lat_0)*Math.cos(lat_0)*
     (U2 +
      Math.cos(lat_0)*Math.cos(lat_0)*
      (U4 +
       U6*Math.cos(lat_0)*Math.cos(lat_0)
       )
      )
     );
    var S0 =k0*w0*r;
    var S =k0*w*r;
    var R =k0*a/Math.sqrt(1-e*e*Math.sin(latitude)*Math.sin(latitude));
    var A2 = R*t/2;
    var A4 = (5-t*t + sn*(9 +4*sn))/12;
    var A6 = (61-58*t*t + t*t*t*t +sn*(270-330*t*t))/360;
    latitude = S -S0 + N0 + A2*L*L*(1 + L*L*(A4+A6*L*L));
    var A1 = R;
    var A3 = (1 - t*t + sn)/6;
    var A5 = (5 - 18*t*t + t*t*t*t + sn*(14-58*t*t))/120;
    var A7 = (61 - 479*t*t + 179*t*t*t*t - t*t*t*t*t*t)/5040;
    longitude = E0 + A1*L*(1+L*L*(A3+L*L*(A5+A7*L*L)));
    if (args[2]) {
        var out_Y = this.METER_TO_USFOOT(latitude);
        var out_X = this.METER_TO_USFOOT(longitude);
	//alert('X: ' + out_X +'\nY: ' + out_Y);
        return new XY(out_X,out_Y);
        
        
    }
},
SPC83Inverse:function(){
    var LL = function(X,Y){
        this.latitude = Y;
        this.longitude = X;
    };
   // LL.prototype.message = function(){alert('hello')};
    var args = Array.prototype.slice.call(arguments);
    if(args.length !== 3){
        throw new Error('Usage: projUtils.SPC83Inverse(x,y,isUSFoot)');
        return;
    }
    if((isNaN(parseFloat(args[0])) || !isFinite(args[0])) || (isNaN(parseFloat(args[1])) || !isFinite(args[1]))){
        throw new Error('x and y should be numbers');
        return;
    }
    if(!(args[2] === true) && !(args[2] === false)){
		throw new Error('isUSFoot value should be true or false')
		return;
	}
    //passed all check points
    if(args[2])
    {
        var x = projUtils.USFOOT_TO_METER(args[0]);
        var y = projUtils.USFOOT_TO_METER(args[1]);
    }
    var a = 6378137.0;
    var b = 6356752.31414;
    var e = Math.sqrt((a*a-b*b)/(a*a));
    var f = (a-b)/a;//1.0/e;
    var se = e*e/(1-e*e);
    var lat_0 = projUtils.DEGREES_TO_RADIANS(38.83333333333334);
    var lon_0 = projUtils.DEGREES_TO_RADIANS(-74.5); //central meridien for NJ
    var N0 = 0.0;
    var E0= 150000.0;
    var n = f/(2.0-f);
    var r = a*(1-n)*(1-n*n)*(1+9*n*n/4 + 225*n*n*n*n/64);
    var k0 = 0.9999;
    var v2 = 3.0*n/2.0 - 27*n*n*n/32.0;
    var v4 = 21.0*n*n/16.0 - 55.0*n*n*n*n/32.0;
    var v6 = 151.0*n*n*n/96.0;
    var v8 = 1097.0*n*n*n*n/512.0;
    var V0 = 2.0*(v2-2.0*v4 + 3.0*v6 - 4.0*v8);
    var V2 = 8.0*(v4 - 4.0*v6 + 10.0*v8);
    var V4 = 32.0*(v6 - 6.0*v8);
    var V6 = 128.0*v8;
    var SE = x-E0;
    
    //-------
    var u2 = -3.0*n/2.0 + 9.0*n*n*n/16.0;
    var u4 = 15.0*n*n/16.0 -15.0*n*n*n*n/32.0;
    var u6 = -35.0*n*n*n/48.0;
    var u8 = 315.0*n*n*n*n/512.0;
    var U0 = 2*(u2-2*u4+3*u6 - 4*u8);
    var U2 = 8*(u4-4*u6+10*u8);
    var U4 = 32*(u6-6*u8);
    var U6 = 128*u8;
    var w0 = lat_0 + Math.sin(lat_0)*Math.cos(lat_0)*
    (U0 +
     Math.cos(lat_0)*Math.cos(lat_0)*
     (U2 +
      Math.cos(lat_0)*Math.cos(lat_0)*
      (U4 +
       U6*Math.cos(lat_0)*Math.cos(lat_0)
       )
      )
     );
    var S0 =k0*w0*r;
    var w = (y - N0 + S0)/(k0*r);
    
    var Ff = w + Math.sin(w)*Math.cos(w)*
    (V0 +
     Math.cos(w)*Math.cos(w)*
     (V2 +
      Math.cos(w)*Math.cos(w)*
      (V4 +
       V6*Math.cos(w)*Math.cos(w)
       )
      )
     );
    var Rf = k0*a/Math.sqrt((1-e*e*Math.sin(Ff)*Math.sin(Ff)));
    var Q = SE/Rf;
    var tf = Math.tan(Ff);
    var snf =se*se*Math.cos(Ff)*Math.cos(Ff);
    var B2 = -tf*(1+snf)/2.0;
    var B4 = -(5 + 3*tf*tf + snf*(1-9*tf*tf) - 4*(snf*snf))/12.0;
    var B6 = (61 + 90*tf*tf + 45*tf*tf*tf*tf + snf*(46 - 252*tf*tf - 90*tf*tf*tf*tf))/360.0;
    var Y = Ff + B2*Q*Q*(1 + Q*Q*(B4 + B6*Q*Q));
    Y = projUtils.RADIANS_TO_DEGREES(Y);
    var B3 = -(1 + 2*tf*tf + snf)/6;
    var B5 = (5 + 28*tf*tf + 24*tf*tf*tf*tf + snf*(6+8*tf*tf))/120.0;
    var B7 = -(61 + 662*tf*tf + 1320*tf*tf*tf*tf + 720*tf*tf*tf*tf*tf*tf)/5040.0;
    var L = Q*(1 + Q*Q*(B3 + Q*Q*(B5+B7*Q*Q)));
    var X = projUtils.RADIANS_TO_DEGREES(lon_0 + L/Math.cos(Ff));
    return new LL(X,Y);
}
};

$('document').ready(function(){
    var _projTable = document.createElement('table');
    _projTable.id='_projTable';
    $('#projection').append(_projTable);
    for(i=0;i<2;i++){
        var _tr = document.createElement('tr');
        _tr.id = '_'+i+'_'+'tr';
        $('#_projTable').append(_tr);
    }
    var _rows = $('#_projTable').find('tr');
    $.each(_rows,function(index,value){
           for(i=0;i<5;i++){
                value.appendChild(document.createElement('td'));
           }
    });
    var _cellsrow1 = $('#_0_tr').find('td');
    var _cellsrow2 = $('#_1_tr').find('td');
    
    var latlbl = document.createTextNode('Latitude: ');
    var _lat = document.createElement('input');
    _lat.value = 40.78264;
    _lat.id = '_lat';
    _cellsrow1[0].appendChild(latlbl);
    _cellsrow1[0].style.font = "normal 400 12px arial,serif";
    _cellsrow1[1].appendChild(_lat);
    var lonlbl = document.createTextNode('Longitude: ');
    var _lon = document.createElement('input');
    _lon.id = '_lon';
    _lon.value = -74.03506;
    _cellsrow1[2].appendChild(lonlbl);
    _cellsrow1[2].style.font = "normal 400 12px arial,serif";
    _cellsrow1[3].appendChild(_lon);
    var _convertbtn = document.createElement('input');
    _convertbtn.setAttribute('type','button');
    _convertbtn.value = 'WGS84ToSPC83';
    _convertbtn.style.backgroundColor = '#f00';
    _convertbtn.style.color = '#fff';
    _convertbtn.style.border = '0';
    
    _cellsrow1[4].appendChild(_convertbtn);
    var _Xlbl = document.createTextNode('X: ');
    _cellsrow2[0].align='right';
    _cellsrow2[0].appendChild(_Xlbl);
    _cellsrow2[0].style.font = "normal 400 12px arial,serif";
    var _xbox = document.createElement('input');
    _xbox.id = '_xbox';
    _cellsrow2[1].appendChild(_xbox);
    var _Ylbl = document.createTextNode('Y: ');
    _cellsrow2[2].align='right';
    _cellsrow2[2].appendChild(_Ylbl);
    _cellsrow2[2].style.font = "normal 400 12px arial,serif";
    var _ybox = document.createElement('input');
    _ybox.id = '_ybox';
    _cellsrow2[3].appendChild(_ybox);
    var _convertwgs84btn = document.createElement('input');
    _convertwgs84btn.setAttribute('type','button');
    _convertwgs84btn.style.backgroundColor = '#f00';
    _convertwgs84btn.style.color = '#fff';
    _convertwgs84btn.style.border = '0';
    _convertwgs84btn.value = 'SPC83ToWGS84';
    _cellsrow2[4].appendChild(_convertwgs84btn);
    var convertToSPC83 = function(){
    var proj = projUtils.SPC83Direct(document.getElementById("_lon").value,document.getElementById("_lat").value,true);
    ($('#projection').find('#_xbox'))[0].value=proj.x.toFixed(5);
    ($('#projection').find('#_ybox'))[0].value=proj.y.toFixed(5);
    /*var _Xbox = $('#projection').find('#_xbox');
    if(!_Xbox[0]){} else {}*/
    };
    var convertToWGS84 =  function(){
    var proj = projUtils.SPC83Inverse(document.getElementById("_xbox").value,document.getElementById("_ybox").value,true);
    ($('#projection').find('#_lon'))[0].value=proj.longitude.toFixed(5);
    ($('#projection').find('#_lat'))[0].value=proj.latitude.toFixed(5);
    };
    $("input:button").css("border-radius","5px");
    $("input").css("border","1px solid red");
    _convertbtn.onclick = convertToSPC83;
    _convertwgs84btn.onclick = convertToWGS84;
    });
