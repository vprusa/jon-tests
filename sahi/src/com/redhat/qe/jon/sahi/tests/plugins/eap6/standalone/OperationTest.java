package com.redhat.qe.jon.sahi.tests.plugins.eap6.standalone;

import java.util.Date;

import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.redhat.qe.auto.testng.Assert;
import com.redhat.qe.jon.sahi.tasks.Navigator.InventoryNavigation;
import com.redhat.qe.jon.sahi.tests.plugins.eap6.AS7PluginSahiTasks;
import com.redhat.qe.jon.sahi.tests.plugins.eap6.AS7PluginSahiTestScript;
import com.redhat.qe.jon.sahi.tests.plugins.eap6.util.SSHClient;

public class OperationTest extends AS7PluginSahiTestScript {
	private InventoryNavigation nav;
	private SSHClient sshClient;
	@BeforeClass(groups = "operation")
	protected void setupAS7Plugin() {
		as7SahiTasks = new AS7PluginSahiTasks(sahiTasks);
		nav = new InventoryNavigation(System.getProperty("agent.name"), "Inventory", System.getProperty("as7.standalone.name"));
        as7SahiTasks.inventorizeResourceByName(System.getProperty("agent.name"), System.getProperty("as7.standalone.name"));
        sshClient = sshStandalone;
        sshClient.connect();
    }
	@Test(groups="operation")
	public void shutdown() {
		Assert.assertTrue(httpStandalone.isRunning(), "Server must be online before we try to stop it");
		sahiTasks.getNavigator().inventoryGoToResource(nav.setInventoryTab("Operations"));
		sahiTasks.cell("New").click();
		sahiTasks.selectComboBoxes("selectItemText-->Shutdown");
		sahiTasks.waitFor(5000);
		sahiTasks.cell("Schedule").click();
		sahiTasks.waitFor(5000);
		assertOperationSuccess(nav,"Shutdown");
		log.fine("Waiting 30s for server to stop");
		Assert.assertFalse(sshClient.isRunning(), "Server process is running");
		Assert.assertFalse(httpStandalone.isRunning(), "Server is reachable via HTTP request");
		boolean ok = false;
		for (int i = 0; i < 10; i++) {
			sahiTasks.waitFor(30000);
			log.fine("Checking that resource is offline: try #"
					+ Integer.toString(i + 1) + " of 10");
			if (!as7SahiTasks.checkIfResourceIsOnline(
					System.getProperty("agent.name"),
					System.getProperty("as7.standalone.name"))) {
				log.fine("Success - resource is offline!");
				ok = true;
				break;
			}
		}
		Assert.assertTrue(ok,"EAP server is offline when server is stopped");
	}

	@Test(groups="operation",dependsOnMethods="shutdown")
	public void start() {
		Assert.assertFalse(httpStandalone.isRunning(), "Server must be offline before we try to stop it");
		sahiTasks.getNavigator().inventoryGoToResource(nav.setInventoryTab("Operations"));
		sahiTasks.cell("New").click();
		sahiTasks.selectComboBoxes("selectItemText-->Start");
		sahiTasks.waitFor(5000);
		sahiTasks.cell("Schedule").click();
		sahiTasks.waitFor(5000);
		assertOperationSuccess(nav,"Start");
		log.fine("Waiting 30s for server to start");
		Assert.assertTrue(sshClient.isRunning(), "Server process is running");
		Assert.assertTrue(httpStandalone.isRunning(), "Server is reachable via HTTP request");
		boolean ok = false;
		for (int i = 0; i < 10; i++) {
			sahiTasks.waitFor(30000);
			log.fine("Checking that resource is online: try #"
					+ Integer.toString(i + 1) + " of 10");
			if (as7SahiTasks.checkIfResourceIsOnline(
					System.getProperty("agent.name"),
					System.getProperty("as7.standalone.name"))) {
				log.fine("Success - resource is online!");
				ok = true;
				break;
			}
		}
		Assert.assertTrue(ok,"EAP server is online when server was started again");
	}

	@Test(groups="operation")
	public void restart() {
		Date startupDate = sshClient.getStartupTime("standalone/log/boot.log");
		sahiTasks.getNavigator().inventoryGoToResource(nav.setInventoryTab("Operations"));
		sahiTasks.cell("New").click();
		sahiTasks.selectComboBoxes("selectItemText-->Restart");
		sahiTasks.waitFor(5000);
		sahiTasks.cell("Schedule").click();
		sahiTasks.waitFor(5000);
		assertOperationSuccess(nav,"Restart");
		log.fine("Waiting 30s for server to restart");
		sahiTasks.waitFor(30*1000);
		Assert.assertTrue(sshClient.isRunning(), "Server process is running");
		Date restartDate = sshClient.getStartupTime("standalone/log/boot.log");
		Assert.assertTrue(restartDate.getTime()>startupDate.getTime(), "Server boot.log first message timestamp check: Server has been restarted");
		Assert.assertTrue(httpStandalone.isRunning(), "Server is reachable via HTTP request");
		log.info("Now, we'll ensure that EAP did not go down after restart");
		boolean ok = true;
		for (int i = 0; i < 10; i++) {
			sahiTasks.waitFor(30000);
			log.fine("Checking that resource is online: try #"
					+ Integer.toString(i + 1) + " of 10");
			if (!as7SahiTasks.checkIfResourceWithChildrenIsOnline(
					System.getProperty("agent.name"),
					System.getProperty("as7.standalone.name"))) {
				log.fine("Resource is offline!");
				ok = false;
			}
			else {
				ok = true;
				log.fine("Resource is online!");
			}
		}
		Assert.assertTrue(ok,"EAP server is online after server was restarted");
	}
	
	@Test(groups="operation")
	public void installRHQUser() {
		sahiTasks.getNavigator().inventoryGoToResource(nav.setInventoryTab("Operations"));
		sahiTasks.cell("New").click();
		sahiTasks.selectComboBoxes("selectItemText-->Install RHQ user");
		sahiTasks.waitFor(5000);
		String user = "u"+new Date().getTime();
		sahiTasks.textbox("user").setValue(user);
		sahiTasks.waitFor(5000);
		sahiTasks.cell("Schedule").click();
		sahiTasks.waitFor(5000);
		assertOperationSuccess(nav,"Install RHQ user");
		String command = "grep '"+user+"' "+System.getProperty("as7.standalone.home") + "/standalone/configuration/mgmt-users.properties";
		Assert.assertTrue(sshClient.runAndWait(command).getStdout().contains(user), "New user was found on EAP machine in mgmt-users.properties");
	}
}