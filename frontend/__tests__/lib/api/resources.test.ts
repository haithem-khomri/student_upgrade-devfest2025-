import { resourcesApi } from '@/lib/api/resources'

describe('Resources API', () => {
  it('should return all resources when no filter', async () => {
    const resources = await resourcesApi.getRecommendations({})

    expect(resources).toBeDefined()
    expect(Array.isArray(resources)).toBe(true)
    expect(resources.length).toBeGreaterThan(0)
  })

  it('should filter resources by moduleId', async () => {
    const resources = await resourcesApi.getRecommendations({
      moduleId: '1',
      limit: 10,
    })

    expect(resources).toBeDefined()
    resources.forEach(resource => {
      expect(resource.moduleId).toBe('1')
    })
  })

  it('should limit number of resources', async () => {
    const resources = await resourcesApi.getRecommendations({
      limit: 2,
    })

    expect(resources.length).toBeLessThanOrEqual(2)
  })

  it('should rate resource successfully', async () => {
    await expect(
      resourcesApi.rateResource('1', 5)
    ).resolves.not.toThrow()
  })

  it('should get all resources for a module', async () => {
    const resources = await resourcesApi.getAllResources('1')

    expect(resources).toBeDefined()
    expect(Array.isArray(resources)).toBe(true)
    resources.forEach(resource => {
      expect(resource.moduleId).toBe('1')
    })
  })
})

