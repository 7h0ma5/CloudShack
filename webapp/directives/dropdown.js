app.service("DropdownService", function($document) {
    var openScope = null;

    this.open = function(dropdownScope) {
        if (!openScope) {
            $document.bind("click", closeDropdown);
            $document.bind("keydown", escapeKeyBind);
        }

        if (openScope && openScope !== dropdownScope) {
            openScope.isOpen = false;
        }

        openScope = dropdownScope;
    };

    this.close = function(dropdownScope) {
        if (openScope === dropdownScope) {
            openScope = null;
            $document.unbind("click", closeDropdown);
            $document.unbind("keydown", escapeKeyBind);
        }
    };

    var closeDropdown = function(evt) {
        // This method may still be called during the same mouse event that
        // unbound this event handler. So check openScope before proceeding.
        if (!openScope) { return; }

        var toggleElement = openScope.getToggleElement();
        if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
            return;
        }

        openScope.$apply(function() {
            openScope.isOpen = false;
        });
    };

    var escapeKeyBind = function(evt) {
        if (evt.which === 27) {
            openScope.focusToggleElement();
            closeDropdown();
        }
    };
})

app.controller("DropdownController", function($scope, $attrs, $parse, DropdownService, $animate) {
    var self = this,
    scope = $scope.$new(), // create a child scope so we are not polluting original one
    getIsOpen,
    setIsOpen = angular.noop,
    toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

    this.init = function(element) {
        self.$element = element;

        if ($attrs.isOpen) {
            getIsOpen = $parse($attrs.isOpen);
            setIsOpen = getIsOpen.assign;

            $scope.$watch(getIsOpen, function(value) {
                scope.isOpen = !!value;
            });
        }
    };

    this.toggle = function(open) {
        return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
    };

    // Allow other directives to watch status
    this.isOpen = function() {
        return scope.isOpen;
    };

    scope.getToggleElement = function() {
        return self.toggleElement;
    };

    scope.focusToggleElement = function() {
        if (self.toggleElement) {
            self.toggleElement[0].focus();
        }
    };

    scope.$watch("isOpen", function(isOpen, wasOpen) {
        $animate[isOpen ? "addClass" : "removeClass"](self.$element, "open");

        if (isOpen) {
            scope.focusToggleElement();
            DropdownService.open(scope);
        } else {
            DropdownService.close(scope);
        }

        setIsOpen($scope, isOpen);
        if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
            toggleInvoker($scope, {open: !!isOpen});
        }
    });

    $scope.$on("$locationChangeSuccess", function() {
        scope.isOpen = false;
    });

    $scope.$on("$destroy", function() {
        scope.$destroy();
    });
})

app.directive("dropdown", function() {
    return {
        controller: "DropdownController",
        link: function(scope, element, attrs, dropdownCtrl) {
            dropdownCtrl.init(element);
        }
    };
})

app.directive("dropdownToggle", function() {
    return {
        require: "?^dropdown",
        link: function(scope, element, attrs, dropdownCtrl) {
            if (!dropdownCtrl) {
                return;
            }

            dropdownCtrl.toggleElement = element;

            var toggleDropdown = function(event) {
                event.preventDefault();

                if (!element.hasClass("disabled") && !attrs.disabled) {
                    scope.$apply(function() {
                        dropdownCtrl.toggle();
                    });
                }
            };

            element.bind("click", toggleDropdown);

            scope.$on("$destroy", function() {
                element.unbind("click", toggleDropdown);
            });
        }
    };
});
