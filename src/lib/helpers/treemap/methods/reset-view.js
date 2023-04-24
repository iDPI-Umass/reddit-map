const resetView = function () {
  this.parent = this.data;
  this.view = this.data.children;
  this.resetScale();
  this.render();
};

export { resetView }