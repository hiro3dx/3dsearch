function executeWidgetCode() {
    require(["DS/WAFData/WAFData",'DS/DataDragAndDrop/DataDragAndDrop'], function(WAFData,DataDragAndDrop) { //DefineでDS/WAFData...やDS/DataDrapAndDrop...と定義しているので、そちらを使用している。パスとかではない
        var myWidget = {
            datafull: [],
            displayobj: [], /*物理プロダクトのデータを入れるための入れ物*/
            csrf_token: [], /*patchで使用するトークンの入れ物*/
            patch_url: [], /*patchで修正するリソース先のURIの入れ物*/
            CEStamp: [], /*PATCHリクエスト時に使用するcestampの値の入れ物 */
            after_patch_displayobj: [],

            onLoadWidget: function() { 
                var dropElement = widget.body;
				//code for drop functionality
				DataDragAndDrop.droppable(dropElement, {
					drop: function(data){
						var obj_JSON = JSON.parse(data); /*ドロップしたJSONデータをJavaScriptで使用できるように、オブジェクトデータに変換*/
						myWidget.dataFull = obj_JSON.data.items; /*データのitemsまでを取得*/
						var objid_data = myWidget.dataFull[0].objectId; /*コンソールでただしく出力されてるか確認する*/
                        myWidget.callData(objid_data); /*callDataファンクションを取得したobjidを引数として実行*/
					},
					enter: function(){
						console.log("Enter");
					},
					leave: function(){
						console.log("Leave");
						
					},
					over: function(){
						console.log("Over");
					} 
					
				}
				);
            },

            callData: function(objid) { //ドロップしたデータからIDを抜き取り、物理プロダクトのデータを取得する。
                var urlWAF = widget.getValue("urlREST") + "/" +objid; /*後ろにつけるIDによって表示するオブジェクトを変更する*/
                myWidget.patch_url.push(urlWAF);
                var dataWAF = {
                   type: widget.getValue("typeObj"),
                };
                var headerWAF = {
                   SecurityContext: widget.getValue("ctx")
                };
                var methodWAF = "GET";
                WAFData.authenticatedRequest(urlWAF, {
                    method: methodWAF,
                    headers: headerWAF,
                    data: dataWAF,
                    type: "json",
                    onComplete: function(dataResp) {
                            myWidget.displayobj = dataResp.member;
                            myWidget.CEStamp = myWidget.displayobj[0].cestamp; //PATCH利用の際の必須データ
                            console.log("CEStamp is :" + myWidget.CEStamp);
                            console.log("Getting data is :"); /*データが入っているかの確認用*/
                            console.log(dataResp);
                            console.log("Keys is :" + Object.keys(myWidget.displayobj[0])); /*JSONデータに入っているキーの確認*/
                            myWidget.displayData(myWidget.displayobj);
                    },
                    onFailure: function(error) {
                        widget.body.innerHTML += "<p>Call Faillure</p>";
                        widget.body.innerHTML += "<p>" + JSON.stringify(error) + "</p>";
                    }
                });
           },


            
            displayData: function(arrData) { //とってきた物理プロダクトのデータの属性情報をテーブルに表示する。
                let json_key = [];
                json_key = Object.keys(arrData[0]);
                var first_key_tableHTML = "<table style='height:100%;overflow:auto;><thead><tr><th>" + json_key[0]; 
                var key_HTML=""; //繰り返し処理で配列内の値を取得する際は初期値の定義が必須。
                var end_key_tableHTML = "</th></tr></thead><tbody>";
                var button_txt = "<button class='test_button'>Change description</button>";

                var txt_table = "<p>修正したい属性の値をテーブルからクリックし、値を入力してください。</p>"
                for (let i=1; i < json_key.length; i++){
                    key_HTML += "</th><th>" + json_key[i]; /*2行上のように""などで初期値を入れておく。しなければundefinedと最初のセルに入ってしまう*/
                }
                var tableHTML = first_key_tableHTML + key_HTML + end_key_tableHTML;
                    tableHTML +=
                        "<tr><td>" +
                        arrData[0].name +
                        "</td><td>" +
                        arrData[0].title +
                        "</td><td contenteditable=\"true\" class=\"change_value\">" + /*ダブルクォーテーションの中で再度ダブルクォーテーションを使いたいときは\"と入力する*/
                        arrData[0].description +
                        "</td><td>" +
                        arrData[0].id +
                        "</td><td>" +
                        arrData[0].type +
                        "</td><td>" +
                        arrData[0].modified +
                        "</td><td>" +
                        arrData[0].created +
                        "</td><td>" +
                        arrData[0].revision +
                        "</td><td>" +
                        arrData[0].state +
                        "</td><td>" +
                        arrData[0].owner +
                        "</td><td>" +
                        arrData[0].organization +
                        "</td><td>" +
                        arrData[0].collabspace +
                        "</td><td>" +
                        arrData[0].cestamp +
                        "</td></tr>";
                tableHTML += "</tbody></table>";

                widget.body.innerHTML += txt_table;
                widget.body.innerHTML += tableHTML;
                widget.body.innerHTML += button_txt;
                myWidget.getcsrf();
                //javascriptではサイト表示の関係上、表示速度を早めるために前の行の処理の完了を待たずにその後の行が実行される。
                myWidget.button_func();
            },

            getcsrf: function(){ //ENO_CSRF_TOKENをリクエストのヘッダー情報に記載することが物理プロダクトを修正する際に必須なので、その値を取得する
                var urlWAF = widget.getValue("urlCSRF")
                var dataWAF = {
                   type: widget.getValue("typeCSRF"),
                };
                var headerWAF = {
                   SecurityContext: widget.getValue("ctx")
                };
                var methodWAF = "GET";
                WAFData.authenticatedRequest(urlWAF, {
                    method: methodWAF,
                    headers: headerWAF,
                    data: dataWAF,
                    type: "json",
                    onComplete: function(dataResp) {
                        str_csrf: [],
                        str_csrf =  dataResp;
                        console.log('CSRFtoken is :' + dataResp.csrf.value);
                        myWidget.csrf_token = str_csrf.csrf.value;
                    },
                    onFailure: function(error) {
                        widget.body.innerHTML += "<p>Call Faillure</p>";
                        widget.body.innerHTML += "<p>" + JSON.stringify(error) + "</p>";
                    }
                });
            },

            button_func: function(){
                var button = widget.body.querySelector('.test_button');
                button.addEventListener("click", myWidget.patch_description);
            },

            patch_description: function(){ //description属性の修正を行う機能。に加えて、テーブル内で編集したdescription属性の値を編集してくる。
                console.log("リクエストのレスポンス待ちです...");
                const changed_description = widget.body.querySelector('.change_value');
                var dataWAF = JSON.stringify({
                    "description":changed_description.textContent, //修正する属性
                    "cestamp": myWidget.CEStamp,//セッションが競合していないかを確認するための値（必須）
                  });
                var headerWAF = {
                   SecurityContext: widget.getValue("ctx"),//PATCHの際は必須
                   ENO_CSRF_TOKEN: myWidget.csrf_token,//PATCHの際は必須
                   'Content-Type' : 'application/json' //送信するデータの形式の指定
                };
                var methodWAF = "PATCH";

                setTimeout(() => {
                    WAFData.authenticatedRequest(myWidget.patch_url[0], {
                        method: methodWAF,
                        headers: headerWAF,
                        data: dataWAF,
                        type: "json", //受け取るデータ(レスポンスデータ)の形式の指定
                        onComplete: function(dataResp) {
                            console.log("データが修正されました。3秒後、修正後の属性テーブルを表示します");

                            setTimeout(() => {
                                var changed_patch_objid = myWidget.dataFull[0].objectId;
                                myWidget.changed_callData(changed_patch_objid);
                            }, 3000)

                        },
                        onFailure: function(error) {
                            widget.body.innerHTML += "<p>Call Faillure</p>";
                            widget.body.innerHTML += "<p>" + JSON.stringify(error) + "</p>";
                        }
                    });
                }, 3000)
            },


            changed_callData: function(objid) { //ドロップしたデータからIDを抜き取り、物理プロダクトのデータを取得する。
                var urlWAF = widget.getValue("urlREST") + "/" +objid; /*後ろにつけるIDによって表示するオブジェクトを変更する*/
                var dataWAF = {
                   type: widget.getValue("typeObj"),
                };
                var headerWAF = {
                   SecurityContext: widget.getValue("ctx")
                };
                var methodWAF = "GET";
                WAFData.authenticatedRequest(urlWAF, {
                    method: methodWAF,
                    headers: headerWAF,
                    data: dataWAF,
                    type: "json",
                    onComplete: function(dataResp) {
                            myWidget.displayobj = dataResp.member;
                            console.log("Changed data is :"); /*データが入っているかの確認用*/
                            console.log(dataResp);
                            widget.body.innerHTML = "<div><p>属性の修正が完了しました。テーブルを確認してください。</p></div>";
                            let changed_json_key = [];
                            changed_json_key = Object.keys(myWidget.displayobj[0]);
                            var first_key_tableHTML = "<table style='height:100%;overflow:auto;><thead><tr><th>" + changed_json_key[0]; 
                            var key_HTML=""; //繰り返し処理で配列内の値を取得する際は初期値の定義が必須。Objectkeysの繰り返し処理で取得したほうが良いかも
                            var end_key_tableHTML = "</th></tr></thead><tbody>";
                            for (let j=1; j < changed_json_key.length; j++){
                                key_HTML += "</th><th>" + changed_json_key[j]; /*2行上のように""などで初期値を入れておく。しなければundefinedと最初のセルに入ってしまう*/
                            }
                            var tableHTML = first_key_tableHTML + key_HTML + end_key_tableHTML;
                                tableHTML +=
                                    "<tr><td>" +
                                    myWidget.displayobj[0].name +
                                    "</td><td>" +
                                    myWidget.displayobj[0].title +
                                    "</td><td contenteditable=\"true\" class=\"changed_value\">" + /*ダブルクォーテーションの中で再度ダブルクォーテーションを使いたいときは\"と入力する*/
                                    myWidget.displayobj[0].description +
                                    "</td><td>" +
                                    myWidget.displayobj[0].id +
                                    "</td><td>" +
                                    myWidget.displayobj[0].type +
                                    "</td><td>" +
                                    myWidget.displayobj[0].modified +
                                    "</td><td>" +
                                    myWidget.displayobj[0].created +
                                    "</td><td>" +
                                    myWidget.displayobj[0].revision +
                                    "</td><td>" +
                                    myWidget.displayobj[0].state +
                                    "</td><td>" +
                                    myWidget.displayobj[0].owner +
                                    "</td><td>" +
                                    myWidget.displayobj[0].organization +
                                    "</td><td>" +
                                    myWidget.displayobj[0].collabspace +
                                    "</td><td>" +
                                    myWidget.displayobj[0].cestamp +
                                    "</td></tr>";
                            tableHTML += "</tbody></table>";
                            widget.body.innerHTML += tableHTML;
                            myWidget.onLoadWidget();
                    },
                    onFailure: function(error) {
                        widget.body.innerHTML += "<p>Call Faillure</p>";
                        widget.body.innerHTML += "<p>" + JSON.stringify(error) + "</p>";
                    }
                });
           },
        };

        widget.addEvent("onLoad", myWidget.onLoadWidget);
        widget.addEvent("onRefresh", myWidget.onLoadWidget);
        widget.addEvent("endEdit",myWidget.onLoadWidget);
        
    });
}
