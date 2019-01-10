'use strict';
module.exports = (sequelize, DataTypes) => {  
  var markdown = sequelize.define('markdown', {
    title: DataTypes.STRING,
    markdown_text: DataTypes.STRING,
    identify_code: DataTypes.STRING,
    is_delete: DataTypes.BOOLEAN
    
    // プログラムとDBの名前解決を行う（マッピング）
    // userName : {
    //   field : 'user_name'
    // },
  }, {
    underscored: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return markdown;
};