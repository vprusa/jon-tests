package com.redhat.qe.jon.clitest.tests.metrics;

import org.testng.annotations.Test;

import com.redhat.qe.jon.clitest.base.CliEngine;
import com.redhat.qe.jon.clitest.base.CliTestRunner;
import com.redhat.qe.jon.common.util.HTTPClient;

@Test(groups="responseTime")
public class ResponseTimeFilterTest extends CliEngine {
    
    private HTTPClient client = new HTTPClient("http://"+System.getProperty("jon.server.host", "localhost")+":7080");
    
    @Override
    public CliTestRunner createJSRunner(String jsFile) {
        return super.createJSRunner(jsFile)
        	.addDepends("rhqapi.js")
        	.addDepends("metrics/common.js");
    }

    @Test
    public void responseTimeRestWar() {
	responseTime(System.getProperty("jon.server.host"), "rhq-rest.war",
	        "rest/reports.html","rest/status.xml","rhqadmin","rhqadmin");
    }
    
    // commented by lzoubek - works locally but fails on jeninks (no call time data is shown)
    // after 2-3 days of investigation I am giving up
    //@Test
    //public void responseTimeCoregui() {
	//responseTime("coregui.war","coregui/","coregui/", null, null);
    //}

    private void responseTime(String platform, String deployment, String endPoint,String flushEndpoint, String user, String pass) {
	int hits = 10;
	createJSRunner("metrics/enableRTFilter.js")
	    .withArg("platform", platform)
		.withArg("deployment", deployment)
		.run();	
	for (int i = 0; i < hits;i++) {
	    client.doGet(endPoint, user, pass);
	}
	log.info("Doing 11 other hits, so we make sure rtFilter flushes hits we're checking");
	for (int i = 0; i < 11;i++) {
	    client.doGet(flushEndpoint, user, pass);
	}
	waitFor(1000 * 3 * 60,"Waiting for metric collection");
	createJSRunner("metrics/validateCallTime.js")
    	.withArg("platform", platform)
    	.withArg("deployment", deployment)
    	.withArg("endpoint", "/"+endPoint)
    	.withArg("hits", String.valueOf(hits))
    	.run();
    }
}
