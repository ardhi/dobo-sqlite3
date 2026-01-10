/**
 * Plugin factory
 *
 * @param {string} pkgName - NPM package name
 * @returns {class}
 */
async function factory (pkgName) {
  const me = this

  /**
   * DoboSqlite3 class
   *
   * @class
   */
  class DoboSqlite3 extends this.app.baseClass.Base {
    constructor () {
      super(pkgName, me.app)
      this.config = {
        options: {
          compileSqlOnError: false
        }
      }
    }
  }
  return DoboSqlite3
}

export default factory
