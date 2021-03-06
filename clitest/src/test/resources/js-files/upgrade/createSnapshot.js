/**
 * This script takes snapshot of JON. Various information are stored to given files.
 * This can be used to store information about JON before/after an upgrade.  
 *
 * @author fbrychta@redhat.com (Filip Brychta)
 * September 12, 2013    
 */
verbose = 2;
var common = new _common();

// todo add plugin configurations
var outputDir = "/home/fbrychta/Work/repo/jon-core/clitest/testik";
var agentId = 10348;

exportAgentPlugins(agentId,outputDir+'/agentPlugins.txt');
exportResourceTypes(outputDir+'/allResTypes.csv');
exportResourcesInInvenotry(outputDir+'/allImportedResources.csv');
exportResourceGroups(outputDir+'/allResGroups.csv');
exportAlertDefinitions(outputDir+'/allAlertDefinitions.csv');
exportAlerts(outputDir+'/allAlerts.csv');
exportAllBundles(outputDir+'/allBundles.csv');
exportAllBundleDestinations(outputDir+'/allBundleDestinations.csv');
exportAllBundleDeployments(outputDir+'/allBundleDeployments.csv');
// not working on jon3.1.2 and older
//exportAllTraits(outputDir+'/allTraits.csv');

exportBaselinesForResource(agentId,outputDir+'/baselinesForRHQAgent.csv');
exportDataForAgent(agentId,outputDir+'/dataForRHQAgent.csv');
exportSystemSettings(outputDir+'/systemSettings.csv');
exportProductInfo(outputDir+'/productInfo.csv');
exportScheduledOperations(outputDir+'/allScheduledOperations.txt');
exportOperationHistory(outputDir+'/completeOperationHistory.txt');
exportDrifdefinitions(outputDir+'/allDriftDefs.csv');
exportDrifs(outputDir+'/allDrifts.csv');
exportRepositories(outputDir+'/allRepositories.csv');
exportUsers(outputDir+'/allUsers.csv');
exportRoles(outputDir+'/allRoles.csv');
exportPackages(outputDir+'/allPackages.csv');
exportInstalledPackages(outputDir+'/allInstalledPackages.csv');


/**
 * Agent plugins
 */
function exportAgentPlugins(agentId,targetFile){
	common.info("Exporting all agent plugins to "+targetFile);
	var agents = resources.find({id:agentId});
	assertTrue(agents.length > 0,"Agent with id " +agentId+" was not found in inventory!!")
	var ret = agents[0].invokeOperation("retrieveAllPluginInfo");
	var plugins = ret.result['plugins'];
	var writer = new java.io.PrintWriter(targetFile);
	
	for(var key in plugins) {
	    var plugin = plugins[key];
	    delete plugin['timestamp'];
	    writer.println(JSON.stringify(plugins[key]));
	}
	writer.close();
}


/**
 * Resources and resource types 
 */
function exportResourcesInInvenotry(targetFile){
	common.info("Exporting all resources in inventory to "+targetFile);
	var resCri = setGenaralOptions(new ResourceCriteria());
	resCri.fetchAlertDefinitions(true);
	resCri.fetchChildResources(true);
	resCri.fetchDriftDefinitions(true);
	resCri.fetchImplicitGroups(true);
	resCri.fetchExplicitGroups(true);
	resCri.fetchOperationHistories(true);
	resCri.fetchParentResource(true);
	resCri.fetchCurrentAvailability(true);
	var res = ResourceManager.findResourcesByCriteria(resCri);
	
	var writer = new java.io.PrintWriter(targetFile);
	var resHash = {};
	// construct a hash from page list of resources and print it using JSON.stringify
	for(var i =0;i<res.size();i++) {
		var resObj = res.get(i);
		var explGroups = resObj.getExplicitGroups().toArray();
		var implGroups = resObj.getImplicitGroups().toArray();
		
		// sort explicit group ids
		var explGroupIdsArr = new Array();
		for(var j in explGroups){
			explGroupIdsArr.push(new String(explGroups[j].getId()));
		}
		explGroupIdsArr.sort(function(a,b){return a-b});
		
		// sort implicit group ids
		var implGroupIdsArr = new Array();
		for(var j in implGroups){
			implGroupIdsArr.push(new String(implGroups[j].getId()));
		}
		implGroupIdsArr.sort(function(a,b){return a-b});
		
		// sort configuration
		var configHash = common.configurationAsHash(resObj.getResourceConfiguration());
		var configArray = new Array();
		for(var key in configHash){
			configArray.push([key,configHash[key]]);
		}
		configArray.sort(function(a,b){
			if ( a[0] < b[0] )
			  return -1;
			if ( a[0] > b[0] )
				return 1;
			return 0;
			});
		
		resHash['id'] = resObj.getId();
		resHash['name'] = new String(resObj.getName());
		resHash['availability'] = new String(resObj.getCurrentAvailability().getAvailabilityType());
		resHash['agentId'] = resObj.getAgent().getId();
		resHash['ancestry'] = new String(resObj.getAncestry());
		resHash['description'] = new String(resObj.getDescription());
		resHash['status'] = new String(resObj.getInventoryStatus().toString());
		if(resObj.getParentResource() != null){
			resHash['parent'] = new String(resObj.getParentResource().getName());
		}
		resHash['resourceType'] = resObj.getResourceType().getId();
		resHash['implGroupIds'] = implGroupIdsArr.toString();
		resHash['explGroupIds'] = explGroupIdsArr.toString();
		resHash['configuration'] = configArray;
		
		writer.println(JSON.stringify(resHash));
	}
	writer.close();
}
function exportResourceTypes(targetFile){
	common.info("Exporting all resources types to "+targetFile);
	var resTypeCri = setGenaralOptions(new ResourceTypeCriteria());
	var resTypes = ResourceTypeManager.findResourceTypesByCriteria(resTypeCri);
	exportToFile(resTypes, targetFile);
}


/**
 * Groups
 */
function exportResourceGroups(targetFile){
	common.info("Exporting all resources groups to "+targetFile);
	var resGroupCri = setGenaralOptions(new ResourceGroupCriteria());
	resGroupCri.fetchExplicitResources(true);
	resGroupCri.fetchImplicitResources(true);
	var resGroups = ResourceGroupManager.findResourceGroupsByCriteria(resGroupCri);
	
	var writer = new java.io.PrintWriter(targetFile);
	var resGroupHash = {};
	// construct a hash from page list of groups and print it using JSON.stringify
	for(var i =0;i<resGroups.size();i++) {
		var resGObj = resGroups.get(i);
		var explRes = resGObj.getExplicitResources().toArray();
		var implRes = resGObj.getImplicitResources().toArray();
		var explResIdsArr = new Array();
		for(var j in explRes){
			explResIdsArr.push(new String(explRes[j].getId()));
		}
		explResIdsArr.sort(function(a,b){return a-b});
		var implResIdsArr = new Array();
		for(var j in implRes){
			implResIdsArr.push(new String(implRes[j].getId()));
		}
		implResIdsArr.sort(function(a,b){return a-b});
		resGroupHash['id'] = resGObj.getId();
		resGroupHash['name'] = new String(resGObj.getName());
		resGroupHash['category'] = new String(resGObj.getGroupCategory().toString());
		if(resGObj.getGroupDefinition()!= null){
			resGroupHash['groupDefId'] = resGObj.getGroupDefinition().getId();
		}
		resGroupHash['description'] = new String(resGObj.getDescription());
		resGroupHash['isRecursive'] = new String(resGObj.isRecursive());
		resGroupHash['explResIds'] = explResIdsArr.toString();
		resGroupHash['implResIds'] = implResIdsArr.toString();
		
		writer.println(JSON.stringify(resGroupHash));
	}
	writer.close();
}


/**
 * Alerts 
 */
function exportAlertDefinitions(targetFile){
	common.info("Exporting all alert definitions to "+targetFile);
	var alertDefCri = setGenaralOptions(new AlertDefinitionCriteria());
	var alertDefs = AlertDefinitionManager.findAlertDefinitionsByCriteria(alertDefCri);
	exportToFile(alertDefs,targetFile );
}
function exportAlerts(targetFile){
	common.info("Exporting all alerts to "+targetFile);
	var alertCri = new AlertCriteria();
	alertCri.clearPaging();
	alertCri.addSortCtime(PageOrdering.ASC);
	var allAlerts = AlertManager.findAlertsByCriteria(alertCri);
	exportToFile(allAlerts,targetFile );
}


/**
 * Bundles 
 */
function exportAllBundles(targetFile){
	common.info("Exporting all bundles to "+targetFile);
	var bundleCri = setGenaralOptions(new BundleCriteria());
	bundleCri.fetchDestinations(true);
	bundleCri.fetchBundleVersions(true);
	bundleCri.fetchPackageType(true);
	bundleCri.fetchRepo(true);
	var allBundles = BundleManager.findBundlesByCriteria(bundleCri);
	exportToFile(allBundles,targetFile);
}
function exportAllBundleDestinations(targetFile){
	common.info("Exporting all bundle destinations to "+targetFile);
	var allBundleDest = BundleManager.findBundleDestinationsByCriteria(new BundleDestinationCriteria());
	exportToFile(allBundleDest,targetFile);
}
function exportAllBundleDeployments(targetFile){
	common.info("Exporting all bundle Deployments to "+targetFile);
	var allBundleDep = BundleManager.findBundleDeploymentsByCriteria(new BundleDeploymentCriteria());
	exportToFile(allBundleDep,targetFile);
}


/**
 * Traits, baselines, data 
 */
// not working on 3.1.2.GA and older
function exportAllTraits(targetFile){
	common.info("Exporting all traits to "+targetFile);
	var cri = new MeasurementDataTraitCriteria();
	cri.clearPaging();
	cri.addSortTimestamp(PageOrdering.ASC);
	var traits = MeasurementDataManager.findTraitsByCriteria(cri);
	exportToFile(traits,targetFile);
}
function exportBaselinesForResource(resourceId,targetFile){
	common.info("Exporting baselines for resource with id '"+resourceId+"' to "+targetFile);
	var baselines = MeasurementBaselineManager.findBaselinesForResource(resourceId);
	exportToFile(baselines,targetFile);
}
function exportDataForAgent(agentId,targetFile){
	var measDefCri = new MeasurementDefinitionCriteria();
	measDefCri.addFilterResourceTypeName("RHQ Agent");
	measDefCri.setStrict(true);
	var measDefs = MeasurementDefinitionManager.findMeasurementDefinitionsByCriteria(measDefCri);
	common.info("Exporting data for resource with id '"+agentId+"' and measurement definition name '"+measDefs.get(0).getName()+"' to "+targetFile);
	var date = new Date();
	var dateMinus1Day = date.getTime() - 1000 * 60 * 60 * 24;
	var data = MeasurementDataManager.findDataForResource(agentId,[measDefs.get(0).getId()],dateMinus1Day,date.getTime(),60);
	exportToFile(data.get(0),targetFile);
}


/**
 * System settings 
 */
function exportSystemSettings(targetFile){
	common.info("Exporting system settings to "+targetFile);
	// note: SystemSetting.SERVER_VERSION is deprecated  - see bz1011971
	var sysSet = SystemManager.getSystemSettings();
	exportToFile(sysSet,targetFile);
}
function exportProductInfo(targetFile){
    common.info("Exporting product info to "+targetFile);
    var info = SystemManager.getProductInfo();
    exporter.setTarget('csv', targetFile);
    exporter.write(info);
}


/**
 * Operations 
 */
function exportScheduledOperations(targetFile){
	var res = getAllResources();
	var writer = new java.io.PrintWriter(targetFile);
	
	for(var i = 0;i<res.size();i++){
		var resource = res.get(i);
		var scheduledOps = OperationManager.findScheduledResourceOperations(resource.getId());
		if(scheduledOps.size() > 0){
			common.info("Exporting scheduled operations for "+resource.getName()+" to "+targetFile);
			common.debug("Number of scheduled operations for "+resource.getName()+" is "+scheduledOps.size());
			for(var j = 0;j<scheduledOps.size();j++){
				var schedOp = scheduledOps.get(j);
				writer.println("id: " + schedOp.getId()
						+ ", name: " + schedOp.getOperationName()
						+ ", resId: " + resource.getId()
						+ ", description: " +schedOp.getDescription()
						+ ", jobGroup: " +schedOp.getJobGroup() 
						+ ", jobName: "+schedOp.getJobName() 
						+ ", jobTrigger: "+schedOp.getJobTrigger().toString() );
			}
		}
	}
	writer.close();
}
function exportOperationHistory(targetFile){
	var writer = new java.io.PrintWriter(targetFile);
	var cri = new ResourceOperationHistoryCriteria();
	cri.addSortStartTime(PageOrdering.ASC);
	cri.fetchResults(true);
	cri.clearPaging();
	var hist = OperationManager.findResourceOperationHistoriesByCriteria(cri);
	common.info("Exporting operation history for to "+targetFile);
	for(var i = 0;i<hist.size();i++){
		writer.println(hist.get(i).toString() + hist.get(i).getOperationDefinition().toString());
	}
	writer.close();
}


/**
 * Drifts
 */
function exportDrifdefinitions(targetFile){
	common.info("Exporting drift definitions to "+targetFile);
	var cri = setGenaralOptions(new DriftDefinitionCriteria());
	var driftDefs = DriftManager.findDriftDefinitionsByCriteria(cri);
	exportToFile(driftDefs,targetFile);
}

function exportDrifs(targetFile){
	common.info("Exporting drifts to "+targetFile);
	var cri = new GenericDriftCriteria();
	cri.addSortCtime(PageOrdering.ASC);
	cri.setPageControl(PageControl.getUnlimitedInstance());
	var drifts = DriftManager.findDriftsByCriteria(cri);
	exportToFile(drifts,targetFile);
}


/**
 * Repositories
 */
function exportRepositories(targetFile){
	common.info("Exporting repositories to "+targetFile);
	var cri = setGenaralOptions(new RepoCriteria());
	var repos = RepoManager.findReposByCriteria(cri);
	exportToFile(repos,targetFile);
}


/**
 * Users, roles
 */
function exportUsers(targetFile){
	common.info("Exporting users to "+targetFile);
	var cri = setGenaralOptions(new SubjectCriteria());
	var allUsers = SubjectManager.findSubjectsByCriteria(cri);
	exportToFile(allUsers,targetFile);
}
function exportRoles(targetFile){
	common.info("Exporting roles to "+targetFile);
	var cri = setGenaralOptions(new RoleCriteria ());
	var allRoles = RoleManager.findRolesByCriteria(cri);
	exportToFile(allRoles,targetFile);
}

/**
 * Packages 
 */
function exportPackages(targetFile){
	common.info("Exporting packages to "+targetFile);
	var cri = setGenaralOptions(new PackageCriteria());
	cri.fetchVersions(true);
	var allPackages = ContentManager.findPackagesByCriteria(cri);
	exportToFile(allPackages,targetFile);
}
function exportInstalledPackages(targetFile){
	common.info("Exporting installed packages to "+targetFile);
	var cri = new InstalledPackageCriteria();
	cri.clearPaging();
	cri.fetchPackageVersion(true);
	cri.fetchResource(true);
	cri.fetchSubject(true);
	var allInstPackages = ContentManager.findInstalledPackagesByCriteria(cri);
	exportToFile(allInstPackages,targetFile);
}


/**
 * Common functions
 */

function printToFile(string,targetFile){
	var writer = new java.io.PrintWriter(targetFile);
	writer.println(string);
	writer.close();
}
function setGenaralOptions(criteria){
	criteria.clearPaging();
	criteria.addSortName(PageOrdering.ASC);
	return criteria;
}

function exportToFile(source, fullFilePath){
	common.info("Number of enteries: " + source.size());
	exporter.setTarget('csv', fullFilePath);
	exporter.write(source);
}

function getAllResources(){
	var resCri = new ResourceCriteria();
	resCri.clearPaging();
	var allRes = ResourceManager.findResourcesByCriteria(resCri);
	common.debug("Number of all found resources: " + allRes.size());
	return allRes;
}