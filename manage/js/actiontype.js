
<!-- page specific plugin scripts -->
toastr.options.positionClass = 'toast-top-center';

var grid_selector = "#grid-table";
var pager_selector = "#grid-pager";




var scripts = [null,"../../../../admin/assets/js/date-time/bootstrap-datepicker.min.js","../../../../admin/assets/js/jqGrid/jquery.jqGrid.min.js","../../../../admin/assets/js/jqGrid/i18n/grid.locale-cn.js", null]
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
            url: $dict_base_path + "/services/msgpush/queryat",
            editurl:$dict_base_path + "/services/msgpush/setat",
            datatype: "json",
            // mtype:"post",
            ajaxGridOptions: {
                               contentType: "application/json",
                },

            /*serializeGridData: function (postData)
            {
                var data = {};
                data.pageSize = getPageSize();
                data.pageNum = getPageNum();
                return JSON.stringify(data);
            },*/
            cellEdit: false,
            height: 600,
            colNames:['id','ActionType','图标','备注'],
            colModel:[
                {name:'id',index:'id', editname:'id',width:60, sortable:false, addable:false,editable:false,hidden:true},
                {name:'actionType',index:'actionType', editname:'actionType',width:60, sortable:false, addable:true,editable:true},
                {name:'icon',index:'icon', editname:'icon',width:60, sortable:false, addable:true,editable:true},
                {name:'remark',index:'remark',editname:'actionTypeRemark',width:60, addable:true,sortable:false, editable:true}
            ],

            jsonReader: {
                root:"ActionTypeVo",
                page:"1",
                total:function (obj) {
                    return obj.length;
                },
                records:function (obj) {
                    return obj.length;
                },
                rowNum:function (obj) {
                    console.log("Langth:"+obj.length);
                    return obj.length;
                },
                repeatitems: false
            },
			prmNames:{page:null,rows:null, sort: null,order: null, search:null, nd:null, npage:null},
            // postData:{pageNum:getPageNum,pageSize:getPageSize},
            rowNum : 20,
            loadonce:true,
            // rowTotal: 2000, //一次加载的最大行数
            rowList:[10,20,30],
            page: 1,
            autowidth : true,
            pager : pager_selector,
            pginput : false,
            pgtext : true,
            sortname : 'key',
            rownumbers: true,	//显示行号
            viewrecords : true,
            rownumWidth: 60,   //行号宽度
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
                var celModel = colModel[iCol];
                console.log(celModel);
                var cellContent = '<input type="text" id="cellinput" style="width: 100%" oriValue="'+cellcontent+'" celname="'+celModel.name+'" rowid="'+rowid+'" iCol="'+iCol+'" value="'+cellcontent+'" /> '
                if(celModel.editable){
                    $(grid_selector).jqGrid('setCell', rowid, iCol, cellContent, '');

                }else {

                }

                $('#cellinput').focus();

                $('#cellinput').bind("blur",function () {

                    var rowid = $(this).attr("rowid");
                    var iCol = $(this).attr("iCol");
                    var oriVlaue = $(this).attr("oriValue");
                    var value = $(this).val();
                    var celName = $(this).attr("celname");
                    $(grid_selector).jqGrid('setCell', rowid, iCol, value , null);

                    if(oriVlaue != value){
                        var rowData = $(grid_selector).jqGrid("getRowData",rowid);
                        var colModel = $(grid_selector).getGridParam('colModel');
                        var data = {};
                        for(var  i = 0; i < colModel.length;i++){
                            if(celName == colModel[i].name){
                                data[colModel[i].editname] = value;
                            }else
                                data[colModel[i].editname] = rowData[colModel[i].name+''];
                        }

                        SendJsonData($dict_base_path + "/services/msgpush/setat",JSON.stringify(data),true,function (data) {
                            console.log(data);
                            if(data.statusCode == 0){
                                toastr.success("ActionType设置成功！ ");
                                $(grid_selector).jqGrid('setCell', rowid, iCol, value , null);
                            }else {
                                toastr.error("添加失败！"+data.description);
                                $(grid_selector).jqGrid('setCell', rowid, iCol, oriVlaue , null);
                            }
                        });
                    }
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
                $('#myModal').modal('show');
            },
            position: "last"

        });



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
            var colModel = $(grid_selector).getGridParam('colModel');
            var colName = $(grid_selector).getGridParam('colNames');
            var content = '';
            for(var i = 0; i <  colName.length; i++){
                if(colModel[i].addable && colName[i] && colName[i] != '')
                    content += '<tr rowpos="'+i+1+'" class="FormData" id="tr_"'+colModel[i].name+'><td class="CaptionTD">'+colName[i]+'</td><td class="DataTD">&nbsp;' +
                    '<input type="text" id="'+colModel[i].name+'" name="value" role="textbox" class="FormElement ui-widget-content ui-corner-all"></td></tr>';
            }

            var body = '<div><table id="TblGrid_grid-table" cellspacing="0" cellpadding="0" border="0">' +
                    '<tbody>' +
                    content
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

                var colModel = $(grid_selector).getGridParam('colModel');
                for(var  i = 0; i < colModel.length;i++){
                    data[colModel[i].editname] = $('#'+colModel[i].name+'').val();
                }

                SendJsonData($dict_base_path + "/services/msgpush/addat",JSON.stringify(data),true,function (data) {
                    if(data.statusCode == 0) {
                        toastr.success("添加成功！");
                        var rowData = {};
                        var colModel = $(grid_selector).getGridParam('colModel');
                        for(var  i = 0; i < colModel.length;i++){
                            rowData[colModel[i].name] = $('#'+colModel[i].name+'').val();
                        }

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

