/*$.extend($.ui.selectable, {
    unselectAll: function () {
        $('.ui-selected', this.element[0]).each(function () {
            var selectee = $.data(this, "selectable-item");
            selectee.$element.removeClass('ui-unselecting');
            selectee.unselecting = false;
            selectee.startselected = false;
            self._trigger("unselected", event, {
                unselected: selectee.element
            });
        });


    }
});*/