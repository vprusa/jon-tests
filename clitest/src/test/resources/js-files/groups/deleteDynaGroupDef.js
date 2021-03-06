/**
 * @author fbrychta@redhat.com (Filip Brychta)
 * June 17, 2013   
 * 
 * This test deletes dynaGroup definitions.
 * 
 * Requires: group/utils.js, rhqapi.js
 *   
 **/

verbose = 2;
common = new _common();

/**
 * Positive scenarios
 */
// remove all dynaGroup definitions
removeAllDynaGroupDefs();
// assert all definitions are gone
var defs = dynaGroupDefinitions.find();
assertTrue(defs.length == 0,"Expected number of all dynaGroup definitions is: 0, but actual is: "+defs.length);
// assert all groups are gone
var allGroups = groups.find({name:"DynaGroup"});
assertTrue(allGroups.length == 0,"Expected number of all dyna groups is: 0, but actual is: "+allGroups.length);
