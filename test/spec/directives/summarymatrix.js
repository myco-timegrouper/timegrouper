'use strict';

describe('Directive: summarymatrix', function () {

  // load the directive's module
  beforeEach(module('timegrouperApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<summarymatrix></summarymatrix>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the summarymatrix directive');
  }));
});
