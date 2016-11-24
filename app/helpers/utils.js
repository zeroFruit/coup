/*
  Utils
*/
module.exports = {
  getLastPhoneNum: function(fullPhoneNum) {
    var arr = fullPhoneNum.split("-");
    return arr[2]; /* This return the last phone number */
  },
  makeJsonPrintForm: function(name, num) {
    return ( "{" + name + "-" + num + "}" );
  },
  tsCreateFromMysql: function(date) {
    /* Split timestamp into [Y, M, D, h, m, s] */
    // var t = date.split(/[- :]/);
    // console.log(t);
    /* Apply each element to the Date function */
    // return new Date(Dat.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
    var d = new Date(Date.parse(date.replace('-','/','g')));
    return d;
  },

  /*
    tsFormater changes dateObj into YYYY/MM/DD hh:mm:ss format String
  */
  tsFormater: function(dateObj) {
    return [dateObj.getFullYear(), dateObj.getMonth()+1, dateObj.getDate()].join('/')
      +" "+[dateObj.getHours(), dateObj.getMinutes(), dateObj.getSeconds()].join(':');
  }
}
