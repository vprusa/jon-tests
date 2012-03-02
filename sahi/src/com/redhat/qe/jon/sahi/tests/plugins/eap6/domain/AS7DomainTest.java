package com.redhat.qe.jon.sahi.tests.plugins.eap6.domain;

import org.testng.annotations.BeforeClass;

import com.redhat.qe.jon.sahi.base.inventory.Resource;
import com.redhat.qe.jon.sahi.tests.plugins.eap6.AS7PluginSahiTasks;
import com.redhat.qe.jon.sahi.tests.plugins.eap6.AS7PluginSahiTestScript;
import com.redhat.qe.jon.sahi.tests.plugins.eap6.util.HTTPClient;
import com.redhat.qe.jon.sahi.tests.plugins.eap6.util.ManagementClient;
import com.redhat.qe.jon.sahi.tests.plugins.eap6.util.AS7SSHClient;

public class AS7DomainTest extends AS7PluginSahiTestScript {
	/**
	 * SSH Client for domain server
	 */
	 protected AS7SSHClient sshClient;
	 /**
	  * DMR Client for DomainController
	  */
	 protected ManagementClient mgmtClient;
	 /**
	  * AS7 Domain controller resource
	  */
	 protected Resource controller;
	 /**
	  * AS7 Host controller resource
	  */
	 protected Resource hostController;
	 /**
	  * managed server ONE resource
	  */
	 protected Resource serverOne;
	 /**
	  * managed server TWO resource
	  */
	 protected Resource serverTwo;
	 /**
	  * managed server THREE resource
	  */
	 protected Resource serverThree;
	 @BeforeClass(groups = "setup")
	 public void setup2() {
		 as7SahiTasks = new AS7PluginSahiTasks(sahiTasks);
		 sshClient = sshDomain;
		 mgmtClient = mgmtDomain;
		 controller = new Resource(sahiTasks, System.getProperty("agent.name"), System.getProperty("as7.domain.controller.name"));
		 hostController = controller.child(System.getProperty("as7.domain.host.name"));
		 serverOne = controller.child(System.getProperty("as7.domain.host.server-one.name"));
		 serverTwo = controller.child(System.getProperty("as7.domain.host.server-two.name"));
		 serverThree = controller.child(System.getProperty("as7.domain.host.server-three.name"));
		 
	 }
}
