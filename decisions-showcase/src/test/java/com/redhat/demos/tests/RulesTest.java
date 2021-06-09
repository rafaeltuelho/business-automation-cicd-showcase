package com.redhat.demos.tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.redhat.demos.decisiontable.Driver;
import com.redhat.demos.decisiontable.Policy;


import org.drools.decisiontable.DecisionTableProviderImpl;
import org.drools.compiler.compiler.DecisionTableProvider;
import org.drools.core.util.IoUtils;
import org.junit.Test;
import org.kie.api.KieServices;
import org.kie.api.cdi.KContainer;
import org.kie.api.command.Command;
import org.kie.api.io.Resource;
import org.kie.api.runtime.ExecutionResults;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.StatelessKieSession;
import org.kie.api.runtime.rule.FactHandle;
import org.kie.dmn.api.core.DMNContext;
import org.kie.dmn.api.core.DMNDecisionResult;
import org.kie.dmn.api.core.DMNModel;
import org.kie.dmn.api.core.DMNResult;
import org.kie.dmn.api.core.DMNRuntime;
import org.kie.internal.builder.DecisionTableConfiguration;
import org.kie.internal.builder.DecisionTableInputType;
import org.kie.internal.builder.KnowledgeBuilderFactory;
import org.kie.internal.command.CommandFactory;
import org.kie.internal.io.ResourceFactory;

public class RulesTest extends RulesBaseTest {

    @Test
    public void rulesTest() {
        KieSession kSession = createSession("rules-session");
        assertNotNull(kSession);

        kSession.insert(Integer.valueOf(50));
        kSession.insert("go");
        kSession.insert(LocalDate.now());

        int fired = kSession.fireAllRules();
        System.out.println("Fired Rules: " + fired);
        kSession.dispose();
    }

    @Test
    public void xlsDecisionTableStatelessSessionTest(){
        StatelessKieSession kSession = createStatelessSession("xls-stateless-session");
        assertNotNull(kSession);
        Resource sheetAsResource = ResourceFactory.newClassPathResource(
            "/com/redhat/demos/decisiontable/ExamplePolicyPricing.xls",
            RulesTest.class);
        this.printGeneratedDRL(sheetAsResource, System.out);

        //now create some test data
        Driver driver = new Driver();
        Policy policy = new Policy();
        List<Command<?>> cmds = new ArrayList<>();
        cmds.add(CommandFactory.newInsert(driver, "driver"));
        cmds.add(CommandFactory.newInsert(policy, "policy"));
        cmds.add(CommandFactory.newFireAllRules(10));
        ExecutionResults results = kSession.execute(CommandFactory.newBatchExecution(cmds));

        Policy policyFact = (Policy)results.getValue("policy");
        System.out.println(policyFact);
    }

    @Test
    public void dmnTest() {
        KieServices ks = KieServices.Factory.get();
        KieContainer kContainer = ks.getKieClasspathContainer();
        DMNRuntime dmnRuntime = kContainer.newKieSession("dmn-session").getKieRuntime(DMNRuntime.class);
        DMNModel dmnModel = dmnRuntime.getModel(
            "https://kiegroup.org/dmn/_4502BB15-E55D-4302-91EA-CFD7E2EA470C", 
            "Loan Approval");
        assertNotNull(dmnModel);

        DMNContext dmnContext = dmnRuntime.newContext();
        assertNotNull(dmnContext);
        dmnContext.set("Credit Score", 680);
        dmnContext.set("DTI", .3);

        System.out.println("Requesting DMN Evaluation...");
        DMNResult dmnResult = dmnRuntime.evaluateAll(dmnModel, dmnContext); 

        System.out.println("\n  DMN Context Data inputs: ");
        dmnResult.getContext().getAll().forEach(
                (key, value) -> { System.out.println( "\tKey: " + key + "," + " Value: " + value ); }
            );

        System.out.println("\n  DMN Context Result Msg: ");
        dmnResult.getMessages().forEach((msg) -> System.out.println("\t" + msg));
        System.out.println("");

        System.out.println("\n  DMN Context Outputs: ");
        for (DMNDecisionResult dr : dmnResult.getDecisionResults()) {
            System.out.println(
                        "Decision: '" + dr.getDecisionName() + "', " +
                        "Result: " + dr.getResult()
                     );
        }
    }

    /**
     * Converts a decision table into DRL and prints the result in the
     * passed OutputStream.
     * @param sheetAsResource the decision table to be converted.
     * @param target the stream where the generated DRL will be printed.
     */
    private void printGeneratedDRL(Resource sheetAsResource, OutputStream target){
        try {
            DecisionTableProvider dtp = new DecisionTableProviderImpl();
            DecisionTableConfiguration dtc = KnowledgeBuilderFactory.newDecisionTableConfiguration();
            dtc.setInputType(DecisionTableInputType.XLS);
            
            String drl = dtp.loadFromResource(sheetAsResource, dtc);
            
            System.out.println("\n\nGenerated DRL for the XLS [" + sheetAsResource.getSourcePath() + "]\n");
            IoUtils.copy(new ByteArrayInputStream(drl.getBytes()), target);
        } catch (IOException ex) {
            throw new IllegalStateException(ex);
        }
    }        
}