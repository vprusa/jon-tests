/**
 * @author lzoubek@redhat.com (Libor Zoubek)
 * Jun 25, 2013
 */

/**
 * This test deploys a specific version of bundle to all platforms 
 */
verbose = 10;
// requred input parameters
var bundleVersion = version;

var b = bundles.find()
assertTrue(b.length == 1, "New bundle was returned from server");

var bundle = b[0];
assertTrue(bundle.versions().length == 2, "2 Bundle versions were uploaded");
assertTrue(bundle.destinations().length == 1, "1 Bundle versions were created");

bundle.deploy(bundle.destinations()[0],{},bundleVersion);

