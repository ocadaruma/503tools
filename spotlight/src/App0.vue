<script setup lang="ts">
import { ref } from 'vue'
import { Auth0ConfigStore } from '@/core/config.ts'
import Container from '@/components/Container.vue'
import TextInput from '@/components/TextInput.vue'
import Form from '@/components/Form.vue'
import Button from '@/components/Button.vue'
import Row from '@/components/Row.vue'
import FormLabel from '@/components/FormLabel.vue'

const domain = ref("")
const clientId = ref("")

async function save() {
  Auth0ConfigStore.save({
    domain: domain.value,
    clientId: clientId.value
  })
  location.reload()
}
</script>

<template>
  <Container>
    <Form>
      <Row>
        <div>The app uses Auth0 to store credentials. Auth0 domain/client ID will be persisted in localStorage</div>
      </Row>
      <Row>
        <FormLabel for="auth0-domain">Auth0 domain:</FormLabel>
        <TextInput id="auth0-domain" placeholder="<your auth0 domain>" v-model="domain"
                   class="w-full md:w-4/5 lg:w-3/5"/>
      </Row>
      <Row>
        <FormLabel for="auth0-client-id">Auth0 client ID:</FormLabel>
        <TextInput id="auth0-client-id" placeholder="<your auth0 client id>" v-model="clientId"
                   class="w-full md:w-4/5 lg:w-3/5"/>
      </Row>
      <Row>
        <Button @click="save" :disabled="!domain || !clientId">Save</Button>
      </Row>
    </Form>
  </Container>
</template>
