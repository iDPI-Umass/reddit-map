const resetView = function () {
  this.parent = this.data;
  this.isTopLevel = true;
  this.view = this.data.children;
  this.resetScale();
  this.render();
};

export { resetView }