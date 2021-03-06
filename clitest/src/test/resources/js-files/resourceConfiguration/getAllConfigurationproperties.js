/**
 * @author ahovsepy@redhat.com (Armine Hovsepyan)
 * 
 */
println("******************* GET ALL CONFIGURATION TEST STARTED ************** ");

//get all configs
var configs = getConfigurationsArray();

println("*******************  ALL CONFIGURATION GOT ************* ");

//write config data into file
writeIntoFile(configs);

println("*******************  Wrote  CONFIGURATION INTO FILE ************* ");

/**
 * Function - get Configurations array for all resources
 * 
 * @param -
 *            
 * @return - configurations array for giving to test as input 
 */
function getConfigurationsArray() {
	
	var myResources = [];
	
	
	resourceTypes.find().forEach(function(type) {
		var r = resources.find({resourceTypeId:type.id});
		if (r.length > 0) {
			
			myResources.push(r[0]);
		}
	});
	
	
	var configs = new Array();

	
	for ( var i = 0; i < myResources.length; i++) {
		var resource = myResources[i];
		var oldConfiguration = resource.getConfiguration();
		
		println("oldConfiguration ################################  " + oldConfiguration);
//		var oldConfiguration = ConfigurationManager
//				.getLiveResourceConfiguration(resource.id, false);
		if (oldConfiguration != null) {
			
			for(key in oldConfiguration) {
				if (!oldConfiguration.hasOwnProperty(key)) {
					continue;
				}
				value = oldConfiguration[key];
				if (key != null && value != null
						&& String.valueOf(value).toString().indexOf(",") == -1
						&& String.valueOf(value).toString().indexOf("$") == -1
						&& String.valueOf(value).toString().indexOf(" ") == -1
						&& String.valueOf(value).toString().indexOf("[") == -1
						&& String.valueOf(value).toString().indexOf("]") == -1
						&& String.valueOf(value).toString().indexOf(";") == -1) {
					if (String.valueOf(value).toString().toString() != "" && key != "") {
						println("*******************  config push ************* ")
						configs.push(key + " bool"
								+ " " + value + " "
								+ resource.id  ) ;
//						configs.push("resId=\"" +resource.id+ "\"  prop=\"" + key+ "\" value=\"" + value + "\"");
					}
				}
			}
				

		}
	}
	println("&&&&&&&&&&&&&&&&&&&&&&&&& configs "+configs.length);
	return configs;
}

/**
 * Function - writes into file configuration data 
 * 
 * @param - configurations array 
 *            
 * @return - 
 */
function writeIntoFile(configs) {

	var file = new java.io.File("/tmp/resourceProperties.txt");
	file.createNewFile();
	var fw = new java.io.FileWriter(file.getAbsoluteFile());
	var bw = new java.io.BufferedWriter(fw);

	for ( var k = 0; k < configs.length; k++) {
		bw.write(configs[k].toString() + "\n");
	}

	bw.close();
	println("Done ################################");

}



