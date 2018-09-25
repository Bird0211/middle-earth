
<!-- page specific plugin scripts -->
toastr.options.positionClass = 'toast-top-center';

var grid_selector = "#grid-table";
var pager_selector = "#grid-pager";

/*

function opwithdraw(rowId) {
    console.log("rowId:" + rowId);
    var url = $dict_base_path + "/services/dict/refreshRedis";
    var rowData = jQuery("#grid-table").jqGrid("getRowData",rowId);
    var data = {};
    data.key = rowData['key'];
    SendJsonData(url,JSON.stringify(data),true,function (data) {
        if(data.statusCode == 0) {
            toastr.success("设置Redis成功！");
            $(grid_selector).jqGrid('setCell', rowId, "redisValue", rowData["value"], '');

        }else {
            toastr.error("设置Redis失败！"+data.description);
        }

    });
};
*/

var scripts = ["js/date-time/bootstrap-datepicker.min.js","js/jqGrid/jquery.jqGrid.min.js","js/jqGrid/i18n/grid.locale-cn.js", null]
ace.load_ajax_scripts(scripts, function() {
    //inline scripts related to this page
    jQuery(function($) {
        //resize to fit page size
        $(window).on('resize.jqGrid', function () {
            $(grid_selector).jqGrid( 'setGridWidth', $(".page-content").width() );
        })
        //resize on sidebar collapse/expand
        var parent_column = $(grid_selector).closest('[class*="col-"]');
        $(document).on('settings.ace.jqGrid' , function(ev, event_name, collapsed) {
            if( event_name === 'sidebar_collapsed' || event_name === 'main_container_fixed' ) {
                //setTimeout is for webkit only to give time for DOM changes and then redraw!!!
                setTimeout(function() {
                    $(grid_selector).jqGrid( 'setGridWidth', parent_column.width() );
                }, 0);
            }
        })


        jQuery(grid_selector).jqGrid({

            //data: grid_data,
            datatype: "local",
            cellEdit: false,
            height: 250,
            colNames:['商品名称','数量','价格',''],
            colModel:[
                {name:'name',index:'name', width:160, sortable:false, editable:false,
                    formatter:function (cellvalue,options,rowObject) {
                        return "<input class='typeahead' style='width: 100%' class='form-control' type='text' placeholder='请输入商品名称'>\n";
                    }},
                {name:'num',index:'num',width:40, sortable:false, editable:false,
                    formatter:function (cellvalue,options,rowObject) {
                        return "<input id='spinner' style='width: 100%' class='ui-spinner-input' name='spinner' type='text' />";
                    }},
                {name:'price',index:'price',width:40, sortable:false, editable:false},
                {name:'option',width:120, sortable:false, editable:false,
                    formatter:function (cellvalue, options, rowObject) {
                        var detail= "";
                        detail += "<button onclick='opwithdraw("+options.rowId+")' value='"+options.rowId+"' type=\"button\" ><span class=\"ui-icon ace-icon fa fa-refresh green\"></span></button>";

                        return detail;}}
            ],

            prmNames:{page:null,rows:null, sort: null,order: null, search:null, nd:null, npage:null},
            // postData:{pageNum:getPageNum,pageSize:getPageSize},
            rowNum : 20,
            rowList:[10,20,30],
            page: 1,
            autowidth : true,
            pager : pager_selector,
            altRows: true,
            pginput : false,
            pgtext : true,
            sortname : 'name',
            rownumbers: true,	//显示行号
            viewrecords : true,
            rownumWidth: 60,   //行号宽度
            rowheight: 300,
            multiselect: true,
            multiboxonly: true,

            //caption: "分组列表",
            loadComplete : function() {
                var table = this;
                setTimeout(function(){
                    styleCheckbox(table);
                    updateActionIcons(table);
                    updatePagerIcons(table);
                    enableTooltips(table);
                }, 0);
            },
            onCellSelect : function (rowid,iCol,cellcontent,e) {
                var colModel = $(grid_selector).getGridParam('colModel');
                var cellContent = '<input type="text" id="cellinput" style="width: 100%" oriValue="'+cellcontent+'" rowid="'+rowid+'" iCol="'+iCol+'" value="'+cellcontent+'" /> '
                var celModel = colModel[iCol];

                if(celModel.editable){
                    $(grid_selector).jqGrid('setCell', rowid, iCol, cellContent, '');

                }else {

                }

                $('#cellinput').focus();

                $('#cellinput').bind("blur",function () {
                /*
                    var rowid = $(this).attr("rowid");
                    var iCol = $(this).attr("iCol");
                    var oriVlaue = $(this).attr("oriValue");
                    var value = $(this).val();
                    $(grid_selector).jqGrid('setCell', rowid, iCol, value , null);

                    var rowData = $(grid_selector).jqGrid("getRowData",rowid);
                    var key = rowData["key"];
                    if(oriVlaue != value){
                        var data = {};
                        data.key = key;
                        data.value = value;
                        data.syncRedis = 0;

                        SendJsonData($dict_base_path + "/services/dict/update",JSON.stringify(data),true,function (data) {
                            console.log(data);
                            if(data.statusCode != 0){
                                toastr.error("设置失败！ "+data.errorMsg);
                                $(grid_selector).jqGrid('setCell', rowid, iCol, oriVlaue , null);
                            }else{
                                toastr.success("设置成功！ ");
                            }
                        });
                    }*/
                })
            }
        });
        $(window).triggerHandler('resize.jqGrid');//trigger window resize to make the grid get the correct size
//		$(grid_selector).jqGrid('filterToolbar',{searchOperators : false});
        //enable search/filter toolbar
        //jQuery(grid_selector).jqGrid('filterToolbar',{defaultSearch:true,stringResult:true})
        //jQuery(grid_selector).filterToolbar({});


        //switch element when editing inline
        function aceSwitch( cellvalue, options, cell ) {
            setTimeout(function(){
                $(cell) .find('input[type=checkbox]')
                    .addClass('ace ace-switch ace-switch-5')
                    .after('<span class="lbl"></span>');
            }, 0);
        }

        function getPageNum() {
            if($(grid_selector).getGridParam('page')){
                return $(grid_selector).getGridParam('page');
            }else {
                return 1;
            }
        }

        function getPageSize() {
            if($(grid_selector).getGridParam('rowNum')){
                return $(grid_selector).getGridParam('rowNum');
            }else {
                return 20;
            }
        }

        //navButtons
        jQuery(grid_selector).jqGrid('navGrid',pager_selector,
            { 	//navbar options
                edit: false,
                editicon : 'ace-icon fa fa-pencil blue',
                editoptions: {},
                add: false,
                addicon : 'ace-icon fa fa-plus-circle purple',
                del: false,
                delicon : 'ace-icon fa fa-trash-o red',
                refresh: false,
                refreshicon : 'ace-icon fa fa-refresh green',
                view: false,
                viewicon : 'ace-icon fa fa-search-plus grey',
                search: false
            },
            {
                //edit record form
                //closeAfterEdit: true,
                //width: 700,
                recreateForm: true,
                beforeShowForm : function(e) {
                    var form = $(e[0]);
                    form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
                    style_edit_form(form);
                }
            },
            {
                //new record form
                //width: 700,
                closeAfterAdd: true,
                recreateForm: true,
                viewPagerButtons: false,
                beforeShowForm : function(e) {
                    var form = $(e[0]);
                    form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
                    style_edit_form(form);
                }
            },
            {
                //delete record form
                recreateForm: true,
                beforeShowForm : function(e) {
                    var form = $(e[0]);
                    if(form.data('styled')) return false;

                    form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
                    style_delete_form(form);

                    form.data('styled', true);
                },
                onClick : function(e) {
                    alert(1);
                }
            }
        ).navButtonAdd(pager_selector,{
            caption: "",
            title:"add",
            buttonicon: "ace-icon fa fa-plus-circle purple",
            onClickButton: function () {

                var rowData = {};
                rowData.name ;
                rowData.num ;
                rowData.price ;
                var maxRowId = $(grid_selector).getGridParam("reccount")
                $(grid_selector).jqGrid('addRowData',maxRowId+1,rowData,"last");
                setSpinner();
                setComplete();
            },
            position: "last"

        }).navButtonAdd(pager_selector,{
            caption: "",
            title:"remove",
            buttonicon: "ace-icon fa fa-trash-o red",
            onClickButton: function () {
                // $('#myModal').modal('show');
            },
            position: "last"
        }).navButtonAdd(pager_selector,{
            caption: "",
            title:"shop car",
            buttonicon: "ace-icon fa fa-shopping-cart",
            onClickButton: function () {
                // $('#myModal').modal('show');
            },
            position: "last"
        });


        function setSpinner() {
            //spinner
            $( "input[name='spinner']:last").spinner({
                create: function( event, ui ) {

                    //add custom classes and icons
                    $(this)
                        .next().addClass('btn btn-success').html('<i class="ace-icon fa fa-plus"></i>')
                        .next().addClass('btn btn-danger').html('<i class="ace-icon fa fa-minus"></i>')

                    //larger buttons on touch devices
                    if('touchstart' in document.documentElement)
                        $(this).closest('.ui-spinner').addClass('ui-spinner-touch');
                }
            });

            // $( "input[name='spinner']:last").css("width","100%");
        }
        var data = [
            { label: "anders", category: "" },
            { label: "andreas", category: "" },
            { label: "antal", category: "" },
            { label: "annhhx10", category: "Products" },
            { label: "annk K12", category: "Products" },
            { label: "annttop C13", category: "Products" },
            { label: "anders andersson", category: "People" },
            { label: "andreas andersson", category: "People" },
            { label: "andreas johnson", category: "People" }
        ];

        //custom autocomplete (category selection)
        $.widget( "custom.catcomplete", $.ui.autocomplete, {
            _renderMenu: function( ul, items ) {
                var that = this,
                    currentCategory = "";
                $.each( items, function( index, item ) {
                    if ( item.category != currentCategory ) {
                        ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
                        currentCategory = item.category;
                    }
                    that._renderItemData( ul, item );
                });
            }
        });

        function setComplete() {
            $(".typeahead:last").catcomplete({
                delay: 1,
                source: data
            });
        }

        function style_edit_form(form) {
            //don't wrap inside a label element, the checkbox value won't be submitted (POST'ed)
            //.addClass('ace ace-switch ace-switch-5').wrap('<label class="inline" />').after('<span class="lbl"></span>');

            //update buttons classes
            var buttons = form.next().find('.EditButton .fm-button');
            buttons.addClass('btn btn-sm').find('[class*="-icon"]').hide();//ui-icon, s-icon
            buttons.eq(0).addClass('btn-primary').prepend('<i class="ace-icon fa fa-check"></i>');
            buttons.eq(1).prepend('<i class="ace-icon fa fa-times"></i>')

            buttons = form.next().find('.navButton a');
            buttons.find('.ui-icon').hide();
            buttons.eq(0).append('<i class="ace-icon fa fa-chevron-left"></i>');
            buttons.eq(1).append('<i class="ace-icon fa fa-chevron-right"></i>');
        }

        function style_delete_form(form) {
            var buttons = form.next().find('.EditButton .fm-button');
            buttons.addClass('btn btn-sm btn-white btn-round').find('[class*="-icon"]').hide();//ui-icon, s-icon
            buttons.eq(0).addClass('btn-danger').prepend('<i class="ace-icon fa fa-trash-o"></i>');
            buttons.eq(1).addClass('btn-default').prepend('<i class="ace-icon fa fa-times"></i>')
        }

        function beforeDeleteCallback(e) {
            var form = $(e[0]);
            if(form.data('styled')) return false;

            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
            style_delete_form(form);

            form.data('styled', true);
        }

        function beforeEditCallback(e) {
            var form = $(e[0]);
            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
            style_edit_form(form);
        }

        $('#myModal').on('show.bs.modal', function (event) {
            var header = "添加记录";
            var body = '<div><table id="TblGrid_grid-table" cellspacing="0" cellpadding="0" border="0">' +
                '<tbody>' +
                '<tr rowpos="1" class="FormData" id="tr_key"><td class="CaptionTD">Key</td><td class="DataTD">&nbsp;' +
                '<input type="text" id="key" name="value" role="textbox" class="FormElement ui-widget-content ui-corner-all"></td></tr>' +
                '<tr rowpos="2" class="FormData" id="tr_value"><td class="CaptionTD">Value</td><td class="DataTD">&nbsp;' +
                '<input type="text" id="value" name="value" role="textbox" class="FormElement ui-widget-content ui-corner-all"></td></tr>' +
                '</tbody></table></div>'
            ;



            var footer = '<button id="confirm" class="btn btn-info btn-sm tooltip-info">确认</button>'+
                '<button class="btn btn-sm" data-dismiss="modal">取消</button>';
            var modal = $(this);
            modal.find('.modal-header').html(header);
            modal.find('.modal-footer').html(footer);
            modal.find('.modal-body').html(body);

            $("#confirm").bind("click",function () {
                var data = {};
                data.key = $('#key').val();
                data.value = $('#value').val();
                data.syncRedis = 0;
                SendJsonData($dict_base_path + "/services/dict/add",JSON.stringify(data),true,function (data) {
                    if(data.statusCode == 0) {
                        toastr.success("添加成功！");
                        var rowData = {};
                        rowData.key = $('#key').val();
                        rowData.value = $('#value').val();
                        rowData.status = 1;
                        rowData.redisValue = '';
                        console.log(JSON.stringify(rowData));
                        $(grid_selector).jqGrid('addRowData', "1",rowData,"first");
                        $('#myModal').modal('hide');
                    }else {
                        toastr.error("添加失败！"+data.description);
                    }

                });
            });

        });

        //it causes some flicker when reloading or navigating grid
        //it may be possible to have some custom formatter to do this as the grid is being created to prevent this
        //or go back to default browser checkbox styles for the grid
        function styleCheckbox(table) {
            /**
             $(table).find('input:checkbox').addClass('ace')
             .wrap('<label />')
             .after('<span class="lbl align-top" />')


             $('.ui-jqgrid-labels th[id*="_cb"]:first-child')
             .find('input.cbox[type=checkbox]').addClass('ace')
             .wrap('<label />').after('<span class="lbl align-top" />');
             */
        }


        //unlike navButtons icons, action icons in rows seem to be hard-coded
        //you can change them like this in here if you want
        function updateActionIcons(table) {
            /**
             var replacement =
             {
                 'ui-ace-icon fa fa-pencil' : 'ace-icon fa fa-pencil blue',
                 'ui-ace-icon fa fa-trash-o' : 'ace-icon fa fa-trash-o red',
                 'ui-icon-disk' : 'ace-icon fa fa-check green',
                 'ui-icon-cancel' : 'ace-icon fa fa-times red'
             };
             $(table).find('.ui-pg-div span.ui-icon').each(function(){
				var icon = $(this);
				var $class = $.trim(icon.attr('class').replace('ui-icon', ''));
				if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
			})
             */
        }

        //replace icons with FontAwesome icons like above
        function updatePagerIcons(table) {
            var replacement =
                {
                    'ui-icon-seek-first' : 'ace-icon fa fa-angle-double-left bigger-140',
                    'ui-icon-seek-prev' : 'ace-icon fa fa-angle-left bigger-140',
                    'ui-icon-seek-next' : 'ace-icon fa fa-angle-right bigger-140',
                    'ui-icon-seek-end' : 'ace-icon fa fa-angle-double-right bigger-140'
                };
            $('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function(){
                var icon = $(this);
                var $class = $.trim(icon.attr('class').replace('ui-icon', ''));

                if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
            })
        }

        function enableTooltips(table) {
            $('.navtable .ui-pg-button').tooltip({container:'body'});
            $(table).find('.ui-pg-div').tooltip({container:'body'});
        }

        // var selr = jQuery(grid_selector).jqGrid('getGridParam','selrow');

        $(document).on('ajaxloadstart', function(e) {
            $(grid_selector).jqGrid('GridUnload');
            $('.ui-jqdialog').remove();

        });
    });
});

