
<!-- page specific plugin scripts -->
toastr.options.positionClass = 'toast-top-center';

var grid_selector = "#grid-table";
var pager_selector = "#grid-pager"

function addMenu(id) {
    $('#myModal').data("parentId",id);
    $('#myModal').modal('show');
}

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


function getTable(tableid,parentId) {
    var paper =pager_selector;
    if(parentId > 0)
           paper = '';
    var table = {
        url: baseurl + "/manage/getAllMenus",
        editurl:baseurl + "/manage/addMenu",
        datatype: "json",
        mtype:"post",
        ajaxGridOptions: {
            contentType: "application/json",
        },

        serializeGridData: function (postData)
        {
            var data = {};
            data.sys = sys;
            data.parenId = parentId;
            return JSON.stringify(data);
        },
        cellEdit: false,
        height: 600,
        colNames:['id','Name','Path','Status','sort','parentId',''],
        colModel:[
            {name:'id',index:'id',width:60, sortable:false, addable:false,editable:false,hidden:true},
            {name:'name',index:'name', width:60, sortable:false, addable:true,editable:true},
            {name:'path',index:'path',width:60, sortable:false, addable:true,editable:true},
            {name:'status',index:'status',width:20,sortable:false,addable:true,editable:true},
            {name:'sort',index:'sort',width:20,sortable:false,addable:true,editable:true},
            {name:'parentId',index:'parentId',width:20,sortable:false,addable:false,editable:false},
            {name:'option',width:20,sortable:false, editable:false,
                formatter:function (cellvalue, options, rowObject) {

                    var detail="<div class='ui-pg-div'> <span data-id='"+rowObject["id"]+"' onclick='addMenu("+rowObject["id"]+")' class=\"ui-icon ace-icon fa fa-plus-circle purple\"></span>" +
                            "</div>"
                        ;

                    return detail;}
            }
        ],

        jsonReader: {
            root:"menus",
            page:"data",
            total:"",
            records:"data",
            repeatitems: false
        },
        prmNames:{page:null,rows:null, sort: null,order: null, search:null, nd:null, npage:null},
        // postData:{pageNum:getPageNum,pageSize:getPageSize},
        rowNum : 20,
        rowList:[10,20,30],
        page: 1,
        autowidth : true,
        pager : paper,
        pginput : false,
        pgtext : true,
        sortname : 'key',
        rownumbers: true,	//显示行号
        viewrecords : true,
        subGrid:true,
        rownumWidth: 60,   //行号宽度
        //caption: "分组列表",
        subGridOptions : {//子表格选项
            plusicon : "ace-icon fa fa-plus center bigger-110 blue",//展开图标
            minusicon : "ace-icon fa fa-minus center bigger-110 blue",//收缩图标
            openicon : "ace-icon fa fa-chevron-right center orange"//打开时左侧图标
        },
        subGridRowExpanded: function(subgrid_id, row_id) {
            var table_id = subgrid_id+"_t";
            var $t = $(tableid).find("#"+table_id);
            if(!$t.length) {
                $t = $("<table id='" + table_id + "'></table>");
                $("#" + subgrid_id).empty().html($t);
                var rowData = $(tableid).jqGrid("getRowData",row_id);
                $t.jqGrid(getTable("#"+table_id,rowData["id"]));
            }
        },
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
            var colModel = $(tableid).getGridParam('colModel');
            var cellContent = '<input type="text" id="cellinput" style="width: 100%" oriValue="'+cellcontent+'" celname="'+colModel.name+'"  rowid="'+rowid+'" iCol="'+iCol+'" value="'+cellcontent+'" /> '
            var celModel = colModel[iCol];
            if(celModel.editable){
                $(tableid).jqGrid('setCell', rowid, iCol, cellContent, '');

            }else {

            }

            $('#cellinput').focus();

            $('#cellinput').bind("blur",function () {

                var rowid = $(this).attr("rowid");
                var iCol = $(this).attr("iCol");
                var oriVlaue = $(this).attr("oriValue");
                var value = $(this).val();
                $(tableid).jqGrid('setCell', rowid, iCol, value , null);

                if(oriVlaue != value){
                    var rowData = $(tableid).jqGrid("getRowData",rowid);
                    console.log(rowData);
                    //var celName = $(this).attr("celname");
                    //var colModel = $(grid_selector).getGridParam('colModel');
                    var data = {};


                     for(var  i = 0; i < colModel.length;i++){
                        if(colModel[i].name == 'option')
                            continue;
                     data[colModel[i].name] = rowData[colModel[i].name+''];
                     }
                    data.sys=sys;

                    SendJsonData(baseurl + "/manage/editMenu",JSON.stringify(data),true,function (data) {
                        console.log(data);

                        if(data.statusCode == 0){
                            toastr.success("菜单设置成功！ ");
                            $(tableid).jqGrid('setCell', rowid, iCol, value , null);
                        }else {
                            toastr.error("添加失败！"+data.description);
                            $(tableid).jqGrid('setCell', rowid, iCol, oriVlaue , null);
                        }

                    });
                }
            })
        }
    }
    return table;
}

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



        jQuery(grid_selector).jqGrid(getTable(grid_selector,0));
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
                $('#myModal').data("parentId",0);
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
            console.log(event);
            var parentId = $('#myModal').data("parentId");
            var header = "添加记录";
            var body = '<div><table id="TblGrid_grid-table" cellspacing="0" cellpadding="0" border="0">' +
                    '<tbody>' +
                    '<tr rowpos="1" class="FormData" id="tr_name"><td class="CaptionTD">Name</td><td class="DataTD">&nbsp;' +
                    '<input type="text" id="name" name="value" role="textbox" class="FormElement ui-widget-content ui-corner-all"></td></tr>' +
                    '<tr rowpos="2" class="FormData" id="tr_path"><td class="CaptionTD">Path</td><td class="DataTD">&nbsp;' +
                    '<input type="text" id="path" name="value" role="textbox" class="FormElement ui-widget-content ui-corner-all"></td></tr>' +
                    '<tr rowpos="3" class="FormData" id="tr_parentId"><td class="CaptionTD">ParentId</td><td class="DataTD">&nbsp;' +
                    '<input readonly="" type="text" id="parentId" name="value" role="textbox" value="'+parentId+'" class="FormElement ui-widget-content ui-corner-all"></td></tr>' +
                    '<tr rowpos="4" class="FormData" id="tr_sort"><td class="CaptionTD">Sort</td><td class="DataTD">&nbsp;' +
                    '<input type="text" id="sort" name="value" role="textbox" class="FormElement ui-widget-content ui-corner-all"></td></tr>' +
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
                data.name = $('#name').val();
                data.path = $('#path').val();
                //data.status = 0;
                data.parentId = $('#parentId').val();
                data.sys = sys;
                data.sort = $('#sort').val();

                SendJsonData(baseurl + "/manage/addMenu",JSON.stringify(data),true,function (data) {
                    if(data.statusCode == 0) {
                        toastr.success("添加成功！");
                        if(data.menu.parentId == 0)
                            $(grid_selector).jqGrid('addRowData', "1",data.menu,"first");
                        $('#myModal').modal('hide');

                    }else {
                        toastr.error("添加失败！"+data.description);
                    }

                });
            });

        });





        // var selr = jQuery(grid_selector).jqGrid('getGridParam','selrow');

        $(document).on('ajaxloadstart', function(e) {
            $(grid_selector).jqGrid('GridUnload');
            $('.ui-jqdialog').remove();
        });
    });
});

